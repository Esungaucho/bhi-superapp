import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronRight, Loader2, CheckCircle, XCircle } from 'lucide-react';

const STATUS_META = {
  pending: { icon: Loader2, spin: true, text: 'Queued', color: 'text-muted-foreground' },
  running: { icon: Loader2, spin: true, text: 'Running', color: 'text-accent' },
  in_progress: { icon: Loader2, spin: true, text: 'Working', color: 'text-accent' },
  completed: { icon: CheckCircle, spin: false, text: 'Done', color: 'text-accent' },
  success: { icon: CheckCircle, spin: false, text: 'Done', color: 'text-accent' },
  failed: { icon: XCircle, spin: false, text: 'Failed', color: 'text-destructive' },
  error: { icon: XCircle, spin: false, text: 'Error', color: 'text-destructive' },
};

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const rawStatus = toolCall.status || 'pending';

  let parsedResults = toolCall.results;
  if (typeof parsedResults === 'string') {
    try { parsedResults = JSON.parse(parsedResults); } catch { /* keep raw */ }
  }

  const isFailed = ['failed', 'error'].includes(rawStatus) ||
    (typeof parsedResults === 'object' && parsedResults !== null && parsedResults.success === false) ||
    (typeof parsedResults === 'string' && /error|failed/i.test(parsedResults));

  const meta = STATUS_META[isFailed ? 'failed' : rawStatus] || STATUS_META.pending;
  const Icon = meta.icon;

  const proj = toolCall.display_projection || {};
  const hideDetails = proj.hide_details && proj.details_redacted;

  const label = isFailed
    ? (proj.error_label || meta.text)
    : ['pending', 'running', 'in_progress'].includes(rawStatus)
      ? (proj.active_label || meta.text)
      : (proj.label || meta.text);

  const fnName = toolCall.name || 'Tool';

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => !hideDetails && setExpanded(!expanded)}
        className={`flex items-center gap-1.5 ${hideDetails ? 'cursor-default' : 'hover:opacity-70 transition-opacity'}`}
      >
        {!hideDetails && (expanded
          ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
          : <ChevronRight className="w-3 h-3 text-muted-foreground" />)}
        <Icon className={`w-3.5 h-3.5 ${meta.spin ? 'animate-spin' : ''} ${meta.color}`} strokeWidth={1.5} />
        <span className="font-medium text-muted-foreground">{fnName}</span>
        <span className={meta.color}>{label}</span>
      </button>
      {expanded && !hideDetails && (
        <div className="mt-1.5 ml-5 space-y-1.5">
          {toolCall.arguments_string && (
            <div>
              <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground/70 mb-0.5">Parameters</p>
              <pre className="text-[10px] bg-muted/60 rounded-lg p-2 overflow-x-auto font-mono">{toolCall.arguments_string}</pre>
            </div>
          )}
          {parsedResults !== undefined && parsedResults !== null && (
            <div>
              <p className="text-[10px] uppercase tracking-luxe-sm text-muted-foreground/70 mb-0.5">Result</p>
              <pre className="text-[10px] bg-muted/60 rounded-lg p-2 overflow-x-auto max-h-40 overflow-y-auto font-mono">
                {typeof parsedResults === 'string' ? parsedResults : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={isUser ? 'flex justify-end animate-fade-in' : 'flex justify-start animate-fade-in'}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card border border-border rounded-bl-md'
        }`}
      >
        {message.content && (isUser
          ? <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          : <ReactMarkdown className="text-sm prose prose-sm max-w-none leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">{message.content}</ReactMarkdown>
        )}
        {message.tool_calls?.map((tc, i) => <FunctionDisplay key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}