"use client";

import { useEffect } from "react";

export function SecretConsole() {
  useEffect(() => {
    // Check if running on localhost
    const isLocalhost = 
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168.") ||
      window.location.hostname === "[::1]";

    // Auto-claim localhost badge if on localhost
    if (isLocalhost) {
      console.log(
        "%c🏠 Running on localhost - claiming developer badge...",
        "color: #64748b; font-size: 14px;"
      );
      
      fetch("/api/claim-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge: "localhost" }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log(
              "%c🏠 127.0.0.1 badge claimed!",
              "color: #64748b; font-size: 14px; font-weight: bold;"
            );
          }
        })
        .catch(() => {});
    }

    // Add secret message to console
    console.log(
      "%c🔍 Looking for secrets?",
      "color: #22c55e; font-size: 16px; font-weight: bold;"
    );
    console.log(
      "%cType: claimBadge('hacker')",
      "color: #a855f7; font-size: 14px;"
    );

    // Add claimBadge function to window
    (window as any).claimBadge = async (badge: string) => {
      if (badge !== "hacker") {
        console.log("%c❌ Invalid badge code", "color: #ef4444;");
        return;
      }

      console.log("%c⏳ Claiming badge...", "color: #f59e0b;");

      try {
        const response = await fetch("/api/claim-badge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ badge }),
        });

        const data = await response.json();

        if (data.success) {
          console.log(
            "%c🎉 " + data.message,
            "color: #22c55e; font-size: 16px; font-weight: bold;"
          );
          console.log(
            "%c↻ Refresh the page to see your new badge!",
            "color: #a855f7;"
          );
        } else if (data.message) {
          console.log("%c⚠️ " + data.message, "color: #f59e0b;");
        } else {
          console.log("%c❌ " + (data.error || "Failed to claim badge"), "color: #ef4444;");
        }
      } catch (error) {
        console.log("%c❌ Error: Not logged in or server error", "color: #ef4444;");
      }
    };

    // Cleanup
    return () => {
      delete (window as any).claimBadge;
    };
  }, []);

  return null;
}
