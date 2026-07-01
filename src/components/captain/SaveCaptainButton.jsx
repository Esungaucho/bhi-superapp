import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SaveCaptainButton({ charter, captainName }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: saved = [] } = useQuery({
    queryKey: ['savedCaptain', charter.id],
    queryFn: () => base44.entities.SavedCaptain.filter({ charter_id: charter.id, user_email: user?.email }),
    enabled: !!user?.email,
  });

  const isSaved = saved.length > 0;
  const savedRecord = saved[0];

  const toggleSave = async () => {
    if (!user?.email) {
      toast({ title: 'Please log in to save captains' });
      return;
    }
    setLoading(true);
    try {
      if (isSaved) {
        await base44.entities.SavedCaptain.delete(savedRecord.id);
        toast({ title: 'Removed from saved captains' });
      } else {
        await base44.entities.SavedCaptain.create({
          user_email: user.email,
          charter_id: charter.id,
          captain_name: captainName || charter.captain_name || charter.name,
          charter_name: charter.name,
          notify_new_dates: true,
        });
        toast({ title: 'Captain saved! You\'ll get alerts for new dates.' });
      }
      queryClient.invalidateQueries({ queryKey: ['savedCaptain', charter.id] });
      queryClient.invalidateQueries({ queryKey: ['savedCaptains'] });
    } catch (e) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <button disabled className="flex items-center gap-1.5 text-xs font-medium border border-border rounded-xl py-2 px-3 text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" /></button>;
  }

  return (
    <button
      onClick={toggleSave}
      className={`flex items-center gap-1.5 text-xs font-medium rounded-xl py-2 px-3 transition-colors ${
        isSaved ? 'bg-accent/10 text-accent border border-accent/30' : 'border border-border text-foreground hover:bg-secondary'
      }`}
    >
      {isSaved ? <Check className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}