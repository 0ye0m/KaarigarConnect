'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: Date | string;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ChatWindowProps {
  bookingId: string;
  currentUserId: string;
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onMarkAsRead: () => Promise<void>;
}

export function ChatWindow({
  bookingId,
  currentUserId,
  messages,
  onSendMessage,
  onMarkAsRead,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onMarkAsRead();
  }, [messages.length, onMarkAsRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return format(d, 'h:mm a');
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return format(d, 'MMM d, yyyy');
  };

  let lastDate = '';

  return (
    <div className="flex flex-col h-[400px] border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="font-semibold">Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMine = msg.sender_id === currentUserId;
              const msgDate = formatDate(msg.created_at);
              const showDateDivider = msgDate !== lastDate;
              
              if (showDateDivider) {
                lastDate = msgDate;
              }

              return (
                <div key={msg.id}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-4">
                      <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                        {msgDate}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender?.avatar_url || ''} />
                      <AvatarFallback className={isMine ? 'bg-primary text-white' : 'bg-gray-300'}>
                        {getInitials(msg.sender?.full_name || null)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isMine ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl ${
                          isMine
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${isMine ? 'text-right' : ''}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
