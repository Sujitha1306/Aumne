import { useState, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { getMessageThread, sendMessage } from '../api/jobs';
import { useToast } from './Toast';

export default function MessageModal({ applicant, job, onClose }) {
  const [thread, setThread] = useState([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    getMessageThread(job.id, applicant.user_id)
      .then(res => setThread(res.data))
      .catch(() => {});
  }, [job.id, applicant.user_id]);

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await sendMessage({ user_id: applicant.user_id, job_id: job.id, body });
      setThread(prev => [...prev, res.data]);
      setBody('');
      addToast('Message sent!', 'success');
    } catch {
      addToast('Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-gray-100 bg-gray-50 shrink-0">
          <div>
            <h3 className="font-bold text-gray-900">Message {applicant.full_name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">Re: {job.title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thread */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {thread.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}
          {thread.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_role === 'company' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender_role === 'company'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                <p>{msg.body}</p>
                <p className={`text-xs mt-1 ${msg.sender_role === 'company' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.sent_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 shrink-0 flex gap-3">
          <input
            type="text"
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-grow rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !body.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
