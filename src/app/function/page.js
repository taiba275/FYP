'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function FunctionPage() {
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/functions', { cache: 'no-store' });
        const data = await res.json();
        if (data.functions) {
          const grouped = {};
          for (const v of data.functions) {
            const L = (v?.[0] || '').toUpperCase();
            if (!grouped[L]) grouped[L] = [];
            grouped[L].push(v);
          }
          Object.keys(grouped).forEach(k => grouped[k].sort((a,b)=>a.localeCompare(b)));
          setMap(grouped);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="px-4 py-10 max-w-screen-xl mx-auto text-gray-800">
      {loading ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
          <div className="custom-loader wrapper scale-[1.4] mb-6">
            <div className="circle"></div><div className="circle"></div><div className="circle"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-1">Loading Functions…</p>
          <p className="text-gray-500 text-base">Please wait while we organize the categories</p>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 border rounded bg-gray-100 flex flex-wrap justify-center gap-2">
            {letters.map(L => (
              <a key={L} href={`#${L}`} className="px-3 py-1 rounded font-medium text-gray-700 hover:text-blue-600">{L}</a>
            ))}
          </div>

          {letters.map(L => map[L]?.length > 0 && (
            <div key={L} id={L} className="mb-10">
              <h2 className="text-2xl font-bold mb-4 border-b pb-1">{L}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {map[L].map(title => (
                  <Link
                    key={title}
                    href={`/?function=${encodeURIComponent(title)}&page=1&clear=1`}
                    className="block text-sm hover:text-blue-600 transition"
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
