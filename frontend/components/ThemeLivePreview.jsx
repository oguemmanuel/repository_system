"use client";

import { useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"

export default function ThemeLivePreview() {
  const [theme, setTheme] = useState("light")
  
  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
        {[
          { id: "light", icon: <Sun size={24} />, label: "Light" },
          { id: "dark", icon: <Moon size={24} />, label: "Dark" },
          { id: "system", icon: <Monitor size={24} />, label: "System" }
        ].map((option) => (
          <div 
            key={option.id}
            onClick={() => setTheme(option.id)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
              transition-all duration-200 hover:bg-gray-50
              ${theme === option.id 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200"}
            `}
          >
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
              {option.icon}
            </div>
            <span className="font-medium">{option.label}</span>
          </div>
        ))}
      </div>
      
      <div className={`
        w-full max-w-2xl overflow-hidden rounded-lg border shadow-lg
        ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
      `}>
        <div className={`
          p-4 flex items-center justify-between border-b
          ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}
        `}>
          <div className="flex items-center gap-3">
            <div className={`
              h-10 w-10 rounded-full flex items-center justify-center font-bold
              ${theme === "dark" ? "bg-blue-600" : "bg-blue-500"}
              text-white
            `}>
              EP
            </div>
            <div>
              <h3 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                EduPortal Settings
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Theme preview
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className={`
              p-2 rounded-md
              ${theme === "dark" 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
            `}>
              <Sun size={18} />
            </button>
            <button className={`
              p-2 rounded-md
              ${theme === "dark" 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-blue-500 text-white hover:bg-blue-600"}
            `}>
              Save
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <h4 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Appearance Settings
            </h4>
            <div className={`
              p-4 rounded-lg
              ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}
            `}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Enable dark mode
                  </div>
                  <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Switch between light and dark theme
                  </div>
                </div>
                <div className={`
                  w-12 h-6 rounded-full relative cursor-pointer
                  ${theme === "dark" ? "bg-blue-600" : "bg-gray-300"}
                `}>
                  <div className={`
                    absolute top-1 h-4 w-4 rounded-full bg-white transition-all
                    ${theme === "dark" ? "left-7" : "left-1"}
                  `}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}