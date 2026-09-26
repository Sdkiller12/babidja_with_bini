'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getThreads, getMessages, sendMessage, Thread, Message } from '@/lib/api/messages';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, Send, MessageSquare, UserCircle2, Building2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function Messenger({ isPro = false }: { isPro?: boolean }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], isLoading: loadingThreads } = useQuery({
    queryKey: ['messaging-threads'],
    queryFn: getThreads,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messaging-messages', activeThreadId],
    queryFn: () => getMessages(activeThreadId!),
    enabled: !!activeThreadId,
    refetchInterval: 5000, // Polling every 5s for simplicity
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(activeThreadId!, text),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['messaging-messages', activeThreadId] });
      queryClient.invalidateQueries({ queryKey: ['messaging-threads'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeThreadId) return;
    sendMutation.mutate(content);
  };

  const activeThread = threads.find((t: Thread) => t.id === activeThreadId);

  return (
    <div className="flex h-[calc(100dvh-12rem)] max-h-[50rem] min-h-[26rem] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:h-[80dvh] md:min-h-[28rem] md:flex-row">
      {/* Sidebar: Threads */}
      <div className="flex max-h-[38%] w-full min-w-0 shrink-0 flex-col border-b border-gray-100 bg-gray-50 md:max-h-none md:w-1/3 md:max-w-xs md:border-b-0 md:border-r">
        <div className="shrink-0 border-b border-gray-100 bg-white p-4">
          <h2 className="text-lg font-bold">Conversations</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="p-8 flex justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">Aucune conversation.</div>
          ) : (
            threads.map((thread: Thread) => (
              <div 
                key={thread.id} 
                onClick={() => setActiveThreadId(thread.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activeThreadId === thread.id ? 'bg-primary/5' : 'hover:bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isPro ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-[#e97c2a]'}`}>
                    {isPro ? <UserCircle2 className="size-5" /> : <Building2 className="size-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-gray-900">
                      {isPro ? `${thread.user?.firstName} ${thread.user?.lastName}` : thread.tenant?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">Réf: {thread.bookingRef}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Panel: Messages */}
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-white">
        {activeThreadId ? (
          <>
            {/* Header */}
            <div className="flex min-w-0 shrink-0 items-center justify-between gap-3 border-b border-gray-100 p-4">
              <div className="min-w-0">
                <h2 className="truncate font-bold text-gray-900">
                  {isPro ? `${activeThread?.user?.firstName} ${activeThread?.user?.lastName}` : activeThread?.tenant?.name}
                </h2>
                <p className="truncate text-xs text-gray-500">Réservation {activeThread?.bookingRef}</p>
              </div>
              <Badge variant="info">En cours</Badge>
            </div>

            {/* Messages Area */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gray-50/50 p-3 sm:p-4">
              {loadingMessages ? (
                <div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MessageSquare className="size-12 mb-3 opacity-20" />
                  <p>Envoyez un message pour démarrer la conversation.</p>
                </div>
              ) : (
                messages.map((msg: Message) => {
                  const isMine = (isPro && msg.senderType === 'TENANT') || (!isPro && msg.senderType === 'CUSTOMER');
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                        {msg.content}
                        <span className={`block text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-gray-100 bg-white p-3 sm:p-4">
              <form onSubmit={handleSend} className="flex min-w-0 gap-2">
                <input 
                  type="text" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrivez votre message..." 
                  className="min-w-0 flex-1 rounded-xl bg-gray-100 border-transparent px-4 py-2 text-base outline-none transition-colors focus:border-primary focus:bg-white focus:ring-0 sm:text-sm"
                />
                <Button type="submit" disabled={!content.trim() || sendMutation.isPending} className="min-h-[44px] shrink-0 rounded-xl px-4">
                  {sendMutation.isPending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="size-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-gray-500">Messagerie Babydja</h3>
            <p className="mt-2 max-w-sm text-center text-sm">Sélectionnez une conversation dans le menu de gauche pour afficher les messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
