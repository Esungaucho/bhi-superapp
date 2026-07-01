import React, { useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft } from 'lucide-react';
import MessageThread from '@/components/babysitting/MessageThread';

export default function BabysittingMessage() {
  const { sitterId } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: sitter } = useQuery({
    queryKey: ['babysitter', sitterId],
    queryFn: () => base44.entities.Babysitter.get(sitterId),
    enabled: !!sitterId,
  });

  const threadId = useMemo(() => user?.email && sitterId ? `${sitterId}_${user.email}` : '', [user?.email, sitterId]);
  const otherName = sitter ? `${sitter.first_name} ${sitter.last_initial}` : 'Sitter';

  if (!user || !sitter) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-background">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          {sitter.profile_photo_url ? (
            <img src={sitter.profile_photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center">
              <span className="text-sm font-medium text-navy">{sitter.first_name?.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{otherName}</p>
            <p className="text-[10px] text-muted-foreground">Secure in-app messaging</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageThread
          thread={threadId}
          currentUser={user}
          otherName={otherName}
          otherRole="sitter"
          bookingId={bookingId}
        />
      </div>
    </div>
  );
}