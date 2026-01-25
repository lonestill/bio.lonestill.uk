"use client";

import { AlertCircle } from "lucide-react";

export function ShutdownBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-950/90 backdrop-blur-md border-b border-red-800 text-red-100 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />
        <div className="flex-1">
          <p className="font-semibold text-red-200">Закрытие проекта</p>
          <p className="text-sm mt-1">Ребята, спасибо, что пользовались сервисом. К сожалению, у меня больше нет желания его поддерживать и развивать. Сайт будет полностью отключен. Полный исходный код в ближайшем времени будет в телеграмм канале <a href="https://t.me/gitty" target="_blank" rel="noopener noreferrer">https://t.me/gitty</a></p>
        </div>
      </div>
    </div>
  );
}
