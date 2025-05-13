"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Users, BookOpen, FileText, Upload, Settings, User, LogOut, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"

// Language data
const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "de", name: "Deutsch" },
]

// Translations for each language
const translations = {
  en: {
    dashboard: "Dashboard",
    users: "Users",
    resources: "Resources",
    pendingApprovals: "Pending Approvals",
    uploadResource: "Upload Resource",
    settings: "Settings",
    myProfile: "My Profile",
    logout: "Logout",
    myResources: "My Resources",
    approvedProjects: "Approved Projects",
    rejectedProjects: "Rejected Projects",
    language: "Language",
  },
  fr: {
    dashboard: "Tableau de bord",
    users: "Utilisateurs",
    resources: "Ressources",
    pendingApprovals: "Approbations en attente",
    uploadResource: "Télécharger une ressource",
    settings: "Paramètres",
    myProfile: "Mon profil",
    logout: "Déconnexion",
    myResources: "Mes ressources",
    approvedProjects: "Projets approuvés",
    rejectedProjects: "Projets rejetés",
    language: "Langue",
  },
  es: {
    dashboard: "Panel de control",
    users: "Usuarios",
    resources: "Recursos",
    pendingApprovals: "Aprobaciones pendientes",
    uploadResource: "Subir recurso",
    settings: "Configuración",
    myProfile: "Mi perfil",
    logout: "Cerrar sesión",
    myResources: "Mis recursos",
    approvedProjects: "Proyectos aprobados",
    rejectedProjects: "Proyectos rechazados",
    language: "Idioma",
  },
  pt: {
    dashboard: "Painel",
    users: "Usuários",
    resources: "Recursos",
    pendingApprovals: "Aprovações pendentes",
    uploadResource: "Carregar recurso",
    settings: "Configurações",
    myProfile: "Meu perfil",
    logout: "Sair",
    myResources: "Meus recursos",
    approvedProjects: "Projetos aprovados",
    rejectedProjects: "Projetos rejeitados",
    language: "Idioma",
  },
  de: {
    dashboard: "Dashboard",
    users: "Benutzer",
    resources: "Ressourcen",
    pendingApprovals: "Ausstehende Genehmigungen",
    uploadResource: "Ressource hochladen",
    settings: "Einstellungen",
    myProfile: "Mein Profil",
    logout: "Abmelden",
    myResources: "Meine Ressourcen",
    approvedProjects: "Genehmigte Projekte",
    rejectedProjects: "Abgelehnte Projekte",
    language: "Sprache",
  },
}

export default function DashboardNav({ isAdmin, isSupervisor, isStudent }) {
  const pathname = usePathname()
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [t, setT] = useState(translations.en)

  // Set initial language based on localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage")
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage)
      setT(translations[savedLanguage])
    } else {
      const browserLang = navigator.language.split("-")[0]
      if (translations[browserLang]) {
        setCurrentLanguage(browserLang)
        setT(translations[browserLang])
      }
    }
  }, [])

  // Update translations when language changes
  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode)
    setT(translations[langCode])
    localStorage.setItem("preferredLanguage", langCode)
    setIsLanguageMenuOpen(false)
  }

  const adminNavItems = [
    {
      title: t.dashboard,
      href: "/dashboard/admin",
      icon: Home,
    },
    {
      title: t.users,
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: t.resources,
      href: "/dashboard/admin/resources",
      icon: BookOpen,
    },
    {
      title: t.pendingApprovals,
      href: "/dashboard/admin/pending",
      icon: FileText,
    },
    {
      title: t.uploadResource,
      href: "/upload",
      icon: Upload,
    },
    {
      title: t.settings,
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
    {
      title: t.myProfile,
      href: "/dashboard/admin/profile",
      icon: User,
    },
  ]

  const supervisorNavItems = [
    {
      title: t.dashboard,
      href: "/dashboard/supervisor",
      icon: Home,
    },
    {
      title: t.pendingApprovals,
      href: "/dashboard/supervisor/pending",
      icon: FileText,
    },
    {
      title: t.approvedProjects,
      href: "/dashboard/supervisor/approved",
      icon: BookOpen,
    },
    {
      title: t.uploadResource,
      href: "/upload",
      icon: Upload,
    },
    {
      title: t.settings,
      href: "/dashboard/supervisor/settings",
      icon: Settings,
    },
    {
      title: t.myProfile,
      href: "/dashboard/supervisor/profile",
      icon: User,
    },
  ]

  const studentNavItems = [
    {
      title: t.dashboard,
      href: "/dashboard/student",
      icon: Home,
    },
    {
      title: t.myResources,
      href: "/dashboard/student/resources",
      icon: BookOpen,
    },
    {
      title: t.uploadResource,
      href: "/upload",
      icon: Upload,
    },
    {
      title: t.settings,
      href: "/dashboard/student/settings",
      icon: Settings,
    },
    {
      title: t.myProfile,
      href: "/dashboard/student/profile",
      icon: User,
    },
  ]

  const navItems = isAdmin ? adminNavItems : isSupervisor ? supervisorNavItems : studentNavItems

  return (
    <nav className="grid items-start gap-2 py-4">
      {navItems.map((item, index) => (
        <Link key={index} href={item.href}>
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn(
              "w-full justify-start cursor-pointer",
              pathname === item.href ? "bg-[#00447c] text-white hover:bg-[#003366] hover:text-white" : "",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}

      {/* Language Switcher */}
      <div className="relative mt-4">
        <button
          onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-left text-white bg-blue-700 hover:bg-blue-600 rounded-md transition-colors"
        >
          <div className="flex items-center">
            <span className="mr-2">{t.language}:</span>
            <span>{languages.find((lang) => lang.code === currentLanguage)?.name}</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isLanguageMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {isLanguageMenuOpen && (
          <div className="absolute left-0 right-0 mt-1 bg-blue-800 rounded-md shadow-lg py-1 z-50">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentLanguage === language.code ? "bg-blue-600 text-white" : "text-white hover:bg-blue-700"
                }`}
              >
                {language.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Link href="/logout">
        <Button
          variant="ghost"
          className="w-full justify-start cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 mt-4"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t.logout}
        </Button>
      </Link>
    </nav>
  )
}
