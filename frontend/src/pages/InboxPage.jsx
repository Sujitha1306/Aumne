import { useState, useEffect } from 'react';
import { getInbox, sendMessage, getMessageThread } from '../api/jobs';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';

export function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    getInbox()
      .then(res => {
        setMessages(res.data);
        // Group by job_id + company_id
        const groups = {};
        res.data.forEach(msg => {
          const key = `${msg.job_id}-${msg.company_id}`;
          if (!groups[key]) groups[key] = { job_id: msg.job_id, company_id: msg.company_id, messages: [] };
          groups[key].messages.push(msg);
        });
        setGrouped(Object.values(groups));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (selectedThread) {
    return <MessageThread thread={selectedThread} user={user} onBack={() => setSelectedThread(null)} setGrouped={setGrouped} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-blue-600" /> Inbox
          {messages.length > 0 && (
            <span className="text-sm font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">{messages.length}</span>
          )}
        </h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => <div key={n} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse" />)}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">Your inbox is empty.</p>
            <p className="text-sm text-gray-400 mt-1">Apply to jobs and companies will reach out here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map((grp, idx) => {
              const latest = grp.messages[grp.messages.length - 1];
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedThread(grp)}
                  className="w-full text-left bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-gray-900">Job #{grp.job_id}</p>
                      <p className="text-sm text-gray-500 truncate mt-0.5">"{latest.body}"</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-400">{new Date(latest.sent_at).toLocaleDateString()}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">{grp.messages.length} message{grp.messages.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageThread({ thread, user, onBack, setGrouped }) {
  const [fullThread, setFullThread] = useState([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    getMessageThread(thread.job_id, user.id)
      .then(res => setFullThread(res.data))
      .catch(() => {});
  }, [thread.job_id, user.id]);

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await sendMessage({ user_id: user.id, job_id: thread.job_id, body });
      setFullThread(prev => [...prev, res.data]);
      setBody('');
      addToast('Reply sent!', 'success');
    } catch {
      addToast('Failed to send reply.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Inbox
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Job #{thread.job_id} — Conversation</h2>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col" style={{ minHeight: '60vh' }}>
          <div className="flex-grow p-6 space-y-4 overflow-y-auto">
            {fullThread.length === 0 && (
              <p className="text-center text-gray-400 py-10">No messages yet.</p>
            )}
            {fullThread.map(msg => {
              const isMe = msg.sender_role === 'seeker';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                    <p className={`text-xs font-semibold mb-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                      {isMe ? 'You' : 'Company'}
                    </p>
                    <p>{msg.body}</p>
                    <p className={`text-xs mt-1.5 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.sent_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 p-4 flex gap-3">
            <input
              type="text"
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a reply..."
              className="flex-grow rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={sending || !body.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition"
            >
              <Send className="h-4 w-4" /> {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
