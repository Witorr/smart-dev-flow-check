import { useEffect, useRef } from "react";

// Calendly URL padrão atualizado para jwitortech/30min
export const DEFAULT_CALENDLY_URL = "https://calendly.com/jwitortech/30min";

export function CalendlyInlineEmbed({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      width="100%"
      height="700"
      frameBorder="0"
      style={{ minWidth: 320, minHeight: 700 }}
      title="Calendly Inline Embed"
      allow="camera; microphone; fullscreen; encrypted-media"
    ></iframe>
  );
}

export function CalendlyPopupButton({ url, prefill }: { url: string; prefill?: Record<string, string> }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleClick = () => {
    // @ts-ignore
    if (window.Calendly) {
      // Monta a URL com prefill se necessário
      let calendlyUrl = url;
      if (prefill && Object.keys(prefill).length > 0) {
        const params = new URLSearchParams();
        Object.entries(prefill).forEach(([key, value]) => params.append(`prefill_${key}`, value));
        calendlyUrl += (url.includes('?') ? '&' : '?') + params.toString();
      }
      // @ts-ignore
      window.Calendly.initPopupWidget({ url: calendlyUrl });
    }
  };

  return (
    <button
      ref={buttonRef}
      className="ml-2 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition"
      onClick={handleClick}
      type="button"
    >
      Agendar via Calendly
    </button>
  );
}
