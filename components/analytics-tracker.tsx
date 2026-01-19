"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface AnalyticsTrackerProps {
  username?: string;
  enabled?: boolean;
}

export function AnalyticsTracker({ username, enabled = true }: AnalyticsTrackerProps) {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string>("");
  const pageStartTime = useRef<number>(Date.now());
  const lastPath = useRef<string>(pathname);

  // Initialize session ID
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let sid = sessionStorage.getItem("analytics_session_id");
    if (!sid) {
      sid = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Track page views and time on page
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const trackPageView = async () => {
      // Send previous page's time on page if path changed
      if (lastPath.current !== pathname && lastPath.current) {
        const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
        
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "pageview",
            sessionId,
            username,
            path: lastPath.current,
            referrer: document.referrer,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            timeOnPage,
          }),
        });
      }

      // Track new page view
      pageStartTime.current = Date.now();
      lastPath.current = pathname;

      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pageview",
          sessionId,
          username,
          path: pathname,
          referrer: document.referrer,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
        }),
      });
    };

    trackPageView();

    // Track when user leaves the page
    const handleBeforeUnload = () => {
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
      
      // Use sendBeacon with Blob for proper JSON content-type
      const pageviewData = JSON.stringify({
        type: "pageview",
        sessionId,
        username,
        path: pathname,
        timeOnPage,
      });
      
      const sessionData = JSON.stringify({
        type: "session",
        sessionId,
        username,
      });
      
      try {
        navigator.sendBeacon(
          "/api/analytics/track",
          new Blob([pageviewData], { type: "application/json" })
        );
        
        navigator.sendBeacon(
          "/api/analytics/track",
          new Blob([sessionData], { type: "application/json" })
        );
      } catch (error) {
        // Silent fail on beacon errors
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, sessionId, username, enabled]);

  // Track clicks on links and buttons
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Find the closest clickable element
      const clickable = target.closest("a, button, [role='button']");
      if (!clickable) return;

      const element = clickable as HTMLElement;
      
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event",
          sessionId,
          username,
          path: pathname,
          eventType: "click",
          eventName: "element_click",
          elementId: element.id || null,
          elementClass: element.className || null,
          elementText: element.textContent?.slice(0, 100) || null,
          eventData: {
            tagName: element.tagName.toLowerCase(),
            href: element.getAttribute("href"),
          },
        }),
      }).catch(() => {}); // Silent fail
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [sessionId, username, pathname, enabled]);

  // Track scroll depth
  useEffect(() => {
    if (!enabled || !sessionId) return;

    let maxScroll = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;

        // Debounce scroll tracking
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "event",
              sessionId,
              username,
              path: pathname,
              eventType: "scroll",
              eventName: "scroll_depth",
              eventData: {
                percentage: maxScroll,
              },
            }),
          }).catch(() => {});
        }, 1000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [sessionId, username, pathname, enabled]);

  // Track visibility changes (tab focus)
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const handleVisibilityChange = () => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event",
          sessionId,
          username,
          path: pathname,
          eventType: "custom",
          eventName: document.hidden ? "tab_hidden" : "tab_visible",
        }),
      }).catch(() => {});
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionId, username, pathname, enabled]);

  return null; // This component doesn't render anything
}

// Hook for manual event tracking
export function useAnalytics() {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let sid = sessionStorage.getItem("analytics_session_id");
    if (!sid) {
      sid = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  const trackEvent = async (
    eventName: string,
    eventData?: Record<string, any>,
    username?: string
  ) => {
    if (!sessionId) return;

    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event",
          sessionId,
          username,
          path: pathname,
          eventType: "custom",
          eventName,
          eventData,
        }),
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  };

  const trackCustom = async (
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>,
    username?: string
  ) => {
    if (!sessionId) return;

    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          sessionId,
          username,
          category,
          action,
          label,
          value,
          metadata,
        }),
      });
    } catch (error) {
      console.error("Failed to track custom event:", error);
    }
  };

  return { trackEvent, trackCustom, sessionId };
}
