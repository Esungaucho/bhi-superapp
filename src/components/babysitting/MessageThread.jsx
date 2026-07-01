import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { MESSAGE_TYPE_META } from '@/lib/babysittingConstants';

export default function MessageThread({ thread, currentUser, otherName, otherRole, bookingId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const scrollRef = useRef(null);
  const { toast } = useToast();

  const loadMessages = async () => {
    try {
      const data = await base44.entities.BabysitterMessage.filter({ thread_id: thread }).sort('-created_date').limit(100);
      setMessages(data.reverse());
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadMessages();
    const unsub = base44.entities.BabysitterMessage.subscribe(() => loadMessages());
    return unsub;
  }, [thread]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !photoUrl) return;
    setSending(true);
    try {
      await base44.entities.BabysitterMessage.create({
        thread_id: thread,
        booking_id: bookingId || undefined,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email,
        sender_role: otherRole === 'sitter' ? 'parent' : 'sitter',
        recipient_email: '',
        recipient_name: otherName,
        body: text.trim(),
        photo_url: photoUrl || undefined,
        message_type: 'text',
      });
      setText('');
      setPhotoUrl('');
      loadMessages();
    } catch (err) {
      toast({ title: 'Message failed', description: err.message, variant: 'destructive' });
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the conversation.</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_email === currentUser.email;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'bg-primary text-primary-foreground' : 'bg-sand text-foreground'} rounded-2xl px-4 py-2.5`}>
                {msg.message_type !== 'text' && (
                  <p className={`text-[10px] font-medium uppercase tracking-wide mb-1 ${isMe ? 'text-primary-foreground/70' : MESSAGE_TYPE_META[msg.message_type]?.color}`}>
                    {MESSAGE_TYPE_META[msg.message_type]?.label}
                  </p>
                )}
                {msg.body && <p className="text-sm">{msg.body}</p>}
                {msg.photo_url && (
                  <img src={msg.photo_url} alt="attachment" className="mt-2 rounded-lg max-w-full" />
                )}
                <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {new Date(msg.created_date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {photoUrl && (
        <div className="px-4 pb-1">
          <img src={photoUrl} alt="pending" className="w-16 h-16 rounded-lg object-cover" />
        </div>
      )}

      <div className="border-t border-border/50 p-3 flex items-center gap-2">
        <label className="cursor-pointer p-2 rounded-full hover:bg-sand/60 transition-colors">
          <ImageIcon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSend}
          disabled={sending || (!text.trim() && !photoUrl)}
          className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}