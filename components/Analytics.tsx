import { env } from "@/lib/env";
import AnalyticsClient from "@/components/AnalyticsClient";

/**
 * Pixel bootstraps. Rendered on the server only when the matching env var is
 * set, so an empty .env ships zero third-party bytes.
 *
 * The inline stubs execute during HTML parse, before React hydrates, so
 * window.fbq / window.ttq / window.gtag exist before any track() call fires.
 * Each stub queues calls until its remote library finishes loading.
 *
 * Page views are NOT fired here. <AnalyticsClient /> fires track("page_view")
 * once on mount so every pixel receives the same event through one wrapper.
 */
export default function Analytics() {
  const scripts: string[] = [];

  if (env.metaPixelId) {
    scripts.push(
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${env.metaPixelId}');`,
    );
  }

  if (env.tiktokPixelId) {
    scripts.push(
      `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${env.tiktokPixelId}');}(window,document,'ttq');`,
    );
  }

  if (env.ga4Id) {
    scripts.push(
      `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${env.ga4Id}',{send_page_view:false});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${env.ga4Id}';document.head.appendChild(s);`,
    );
  }

  return (
    <>
      {scripts.map((code, i) => (
        <script key={i} dangerouslySetInnerHTML={{ __html: code }} />
      ))}
      <AnalyticsClient />
    </>
  );
}
