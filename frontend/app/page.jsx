"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import cugLogo from "@/public/assets/cug-logo.jpg";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Search,
  Upload,
  Users,
  ChevronRight,
  Bookmark,
  Clock,
  Star,
  User,
  LogOut,
  Settings,
} from "lucide-react"
import PublicSearch from "@/components/public-search"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Image from "next/image";

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
    home: "Home",
    about: "About",
    contact: "Contact",
    login: "Log in",
    logout: "Log out",
    profile: "Profile",
    dashboard: "Dashboard",
    settings: "Settings",
    officialResource: "Official Resource Platform",
    title: "Catholic University of Ghana Repository System",
    subtitle:
      "A centralized platform for storing, organizing, and accessing past exam questions, theses, and final year projects.",
    registerNow: "Register Now",
    searchRepository: "Search Repository",
    updatedRegularly: "Updated regularly with the latest academic resources",
    keyResources: "Key Resources Available",
    pastExams: "Past Exam Questions",
    pastExamsDesc: "Access previous semester exam questions for better preparation.",
    thesesProjects: "Theses & Projects",
    thesesProjectsDesc: "Browse through final year projects and theses for research inspiration.",
    easySubmission: "Easy Submission",
    easySubmissionDesc: "Submit your work securely with our streamlined upload process.",
    exploreResources: "Explore Resources",
    browseRepository: "Browse Repository",
    exploreCollection: "Explore our collection of academic resources freely.",
    moreFeatures: "Want to access more features?",
    createAccount: "Create an Account",
    systemFeatures: "System Features",
    featuresTitle: "Features of our Repository System",
    featuresSubtitle: "Our system provides a comprehensive solution for managing academic resources at CUG.",
    centralizedStorage: "Centralized Storage",
    centralizedStorageDesc: "Store all academic resources in one secure location for easy access.",
    advancedSearch: "Advanced Search",
    advancedSearchDesc: "Find resources quickly with our powerful search functionality.",
    userManagement: "User Management",
    userManagementDesc: "Role-based access control for students, faculty, and administrators.",
    fileManagement: "File Management",
    fileManagementDesc: "Upload, download, and organize files with ease.",
    footerText: "A centralized platform for storing, organizing, and accessing academic resources.",
    copyright: "© 2024 Catholic University of Ghana. All rights reserved.",
    quickLinks: "Quick Links",
    legal: "Legal",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    faq: "FAQ",
    help: "Help Center",
    welcomeBack: "Welcome back",
    indexNumber: "Index Number",
    email: "Email",
    role: "Role",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    contact: "Contact",
    login: "Connexion",
    logout: "Déconnexion",
    profile: "Profil",
    dashboard: "Tableau de bord",
    settings: "Paramètres",
    officialResource: "Plateforme de ressources officielle",
    title: "Système de dépôt de l'Université Catholique du Ghana",
    subtitle:
      "Une plateforme centralisée pour stocker, organiser et accéder aux questions d'examen précédentes, thèses et projets de fin d'études.",
    registerNow: "S'inscrire maintenant",
    searchRepository: "Rechercher dans le dépôt",
    updatedRegularly: "Mis à jour régulièrement avec les dernières ressources académiques",
    keyResources: "Ressources clés disponibles",
    pastExams: "Questions d'examens précédents",
    pastExamsDesc: "Accédez aux questions d'examen des semestres précédents pour une meilleure préparation.",
    thesesProjects: "Thèses et projets",
    thesesProjectsDesc: "Parcourez les projets de fin d'études et les thèses pour l'inspiration de recherche.",
    easySubmission: "Soumission facile",
    easySubmissionDesc: "Soumettez votre travail en toute sécurité avec notre processus de téléchargement rationalisé.",
    exploreResources: "Explorer les ressources",
    browseRepository: "Parcourir le dépôt",
    exploreCollection: "Explorez notre collection de ressources académiques librement.",
    moreFeatures: "Vous voulez accéder à plus de fonctionnalités?",
    createAccount: "Créer un compte",
    systemFeatures: "Fonctionnalités du système",
    featuresTitle: "Fonctionnalités de notre système de dépôt",
    featuresSubtitle: "Notre système fournit une solution complète pour la gestion des ressources académiques à l'UCG.",
    centralizedStorage: "Stockage centralisé",
    centralizedStorageDesc:
      "Stockez toutes les ressources académiques dans un emplacement sécurisé pour un accès facile.",
    advancedSearch: "Recherche avancée",
    advancedSearchDesc: "Trouvez rapidement des ressources avec notre fonctionnalité de recherche puissante.",
    userManagement: "Gestion des utilisateurs",
    userManagementDesc:
      "Contrôle d'accès basé sur les rôles pour les étudiants, les professeurs et les administrateurs.",
    fileManagement: "Gestion des fichiers",
    fileManagementDesc: "Téléchargez, téléchargez et organisez des fichiers facilement.",
    footerText: "Une plateforme centralisée pour stocker, organiser et accéder aux ressources académiques.",
    copyright: "© 2024 Université Catholique du Ghana. Tous droits réservés.",
    quickLinks: "Liens rapides",
    legal: "Légal",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialité",
    faq: "FAQ",
    help: "Centre d'aide",
    welcomeBack: "Bon retour",
    indexNumber: "Numéro d'index",
    email: "Email",
    role: "Rôle",
  },
  es: {
    home: "Inicio",
    about: "Acerca de",
    contact: "Contacto",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    profile: "Perfil",
    dashboard: "Panel de control",
    settings: "Configuración",
    officialResource: "Plataforma de recursos oficial",
    title: "Sistema de Repositorio de la Universidad Católica de Ghana",
    subtitle:
      "Una plataforma centralizada para almacenar, organizar y acceder a exámenes pasados, tesis y proyectos de fin de año.",
    registerNow: "Registrarse ahora",
    searchRepository: "Buscar en el repositorio",
    updatedRegularly: "Actualizado regularmente con los últimos recursos académicos",
    keyResources: "Recursos clave disponibles",
    pastExams: "Exámenes pasados",
    pastExamsDesc: "Acceda a preguntas de exámenes de semestres anteriores para una mejor preparación.",
    thesesProjects: "Tesis y proyectos",
    thesesProjectsDesc: "Explore proyectos de fin de año y tesis para inspiración en investigación.",
    easySubmission: "Envío fácil",
    easySubmissionDesc: "Envíe su trabajo de forma segura con nuestro proceso de carga simplificado.",
    exploreResources: "Explorar recursos",
    browseRepository: "Explorar repositorio",
    exploreCollection: "Explore nuestra colección de recursos académicos libremente.",
    moreFeatures: "¿Desea acceder a más funciones?",
    createAccount: "Crear una cuenta",
    systemFeatures: "Características del sistema",
    featuresTitle: "Características de nuestro sistema de repositorio",
    featuresSubtitle: "Nuestro sistema proporciona una solución integral para gestionar recursos académicos en UCG.",
    centralizedStorage: "Almacenamiento centralizado",
    centralizedStorageDesc: "Almacene todos los recursos académicos en una ubicación segura para un acceso fácil.",
    advancedSearch: "Búsqueda avanzada",
    advancedSearchDesc: "Encuentre recursos rápidamente con nuestra potente funcionalidad de búsqueda.",
    userManagement: "Gestión de usuarios",
    userManagementDesc: "Control de acceso basado en roles para estudiantes, profesores y administradores.",
    fileManagement: "Gestión de archivos",
    fileManagementDesc: "Suba, descargue y organice archivos con facilidad.",
    footerText: "Una plataforma centralizada para almacenar, organizar y acceder a recursos académicos.",
    copyright: "© 2024 Universidad Católica de Ghana. Todos los derechos reservados.",
    quickLinks: "Enlaces rápidos",
    legal: "Legal",
    terms: "Términos de servicio",
    privacy: "Política de privacidad",
    faq: "Preguntas frecuentes",
    help: "Centro de ayuda",
    welcomeBack: "Bienvenido de nuevo",
    indexNumber: "Número de índice",
    email: "Correo electrónico",
    role: "Rol",
  },
  pt: {
    home: "Início",
    about: "Sobre",
    contact: "Contato",
    login: "Entrar",
    logout: "Sair",
    profile: "Perfil",
    dashboard: "Painel",
    settings: "Configurações",
    officialResource: "Plataforma de Recursos Oficial",
    title: "Sistema de Repositório da Universidade Católica de Gana",
    subtitle:
      "Uma plataforma centralizada para armazenar, organizar e acessar questões de exames passados, teses e projetos de final de ano.",
    registerNow: "Registrar agora",
    searchRepository: "Pesquisar repositório",
    updatedRegularly: "Atualizado regularmente com os últimos recursos acadêmicos",
    keyResources: "Recursos-chave disponíveis",
    pastExams: "Questões de exames passados",
    pastExamsDesc: "Acesse questões de exames de semestres anteriores para uma melhor preparação.",
    thesesProjects: "Teses e projetos",
    thesesProjectsDesc: "Navegue por projetos de final de ano e teses para inspiração em pesquisa.",
    easySubmission: "Submissão fácil",
    easySubmissionDesc: "Envie seu trabalho com segurança com nosso processo de upload simplificado.",
    exploreResources: "Explorar recursos",
    browseRepository: "Navegar no repositório",
    exploreCollection: "Explore nossa coleção de recursos acadêmicos livremente.",
    moreFeatures: "Deseja acessar mais recursos?",
    createAccount: "Criar uma conta",
    systemFeatures: "Recursos do sistema",
    featuresTitle: "Recursos do nosso sistema de repositório",
    featuresSubtitle: "Nosso sistema fornece uma solução abrangente para gerenciar recursos acadêmicos na UCG.",
    centralizedStorage: "Armazenamento centralizado",
    centralizedStorageDesc: "Armazene todos os recursos acadêmicos em um local seguro para fácil acesso.",
    advancedSearch: "Pesquisa avançada",
    advancedSearchDesc: "Encontre recursos rapidamente com nossa poderosa funcionalidade de pesquisa.",
    userManagement: "Gerenciamento de usuários",
    userManagementDesc: "Controle de acesso baseado em funções para alunos, professores e administradores.",
    fileManagement: "Gerenciamento de arquivos",
    fileManagementDesc: "Faça upload, download e organize arquivos com facilidade.",
    footerText: "Uma plataforma centralizada para armazenar, organizar e acessar recursos acadêmicos.",
    copyright: "© 2024 Universidade Católica de Gana. Todos os direitos reservados.",
    quickLinks: "Links rápidos",
    legal: "Legal",
    terms: "Termos de serviço",
    privacy: "Política de privacidade",
    faq: "Perguntas frequentes",
    help: "Central de ajuda",
    welcomeBack: "Bem-vindo de volta",
    indexNumber: "Número de índice",
    email: "Email",
    role: "Função",
  },
  de: {
    home: "Startseite",
    about: "Über uns",
    contact: "Kontakt",
    login: "Anmelden",
    logout: "Abmelden",
    profile: "Profil",
    dashboard: "Dashboard",
    settings: "Einstellungen",
    officialResource: "Offizielle Ressourcenplattform",
    title: "Repository-System der Katholischen Universität Ghana",
    subtitle:
      "Eine zentrale Plattform zum Speichern, Organisieren und Zugreifen auf vergangene Prüfungsfragen, Abschlussarbeiten und Jahresprojekte.",
    registerNow: "Jetzt registrieren",
    searchRepository: "Repository durchsuchen",
    updatedRegularly: "Regelmäßig mit den neuesten akademischen Ressourcen aktualisiert",
    keyResources: "Verfügbare Schlüsselressourcen",
    pastExams: "Vergangene Prüfungsfragen",
    pastExamsDesc: "Zugriff auf Prüfungsfragen aus früheren Semestern zur besseren Vorbereitung.",
    thesesProjects: "Abschlussarbeiten & Projekte",
    thesesProjectsDesc: "Durchsuchen Sie Jahresprojekte und Abschlussarbeiten für Forschungsinspiration.",
    easySubmission: "Einfache Einreichung",
    easySubmissionDesc: "Reichen Sie Ihre Arbeit sicher mit unserem optimierten Upload-Prozess ein.",
    exploreResources: "Ressourcen erkunden",
    browseRepository: "Repository durchsuchen",
    exploreCollection: "Entdecken Sie unsere Sammlung akademischer Ressourcen frei.",
    moreFeatures: "Möchten Sie auf mehr Funktionen zugreifen?",
    createAccount: "Konto erstellen",
    systemFeatures: "Systemfunktionen",
    featuresTitle: "Funktionen unseres Repository-Systems",
    featuresSubtitle:
      "Unser System bietet eine umfassende Lösung für die Verwaltung akademischer Ressourcen an der KUG.",
    centralizedStorage: "Zentralisierte Speicherung",
    centralizedStorageDesc: "Speichern Sie alle akademischen Ressourcen an einem sicheren Ort für einfachen Zugriff.",
    advancedSearch: "Erweiterte Suche",
    advancedSearchDesc: "Finden Sie schnell Ressourcen mit unserer leistungsstarken Suchfunktion.",
    userManagement: "Benutzerverwaltung",
    userManagementDesc: "Rollenbasierte Zugriffskontrolle für Studenten, Fakultät und Administratoren.",
    fileManagement: "Dateiverwaltung",
    fileManagementDesc: "Laden Sie Dateien hoch, herunter und organisieren Sie sie mit Leichtigkeit.",
    footerText: "Eine zentrale Plattform zum Speichern, Organisieren und Zugreifen auf akademische Ressourcen.",
    copyright: "© 2024 Katholische Universität Ghana. Alle Rechte vorbehalten.",
    quickLinks: "Schnelllinks",
    legal: "Rechtliches",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutzrichtlinie",
    faq: "FAQ",
    help: "Hilfezentrum",
    welcomeBack: "Willkommen zurück",
    indexNumber: "Indexnummer",
    email: "E-Mail",
    role: "Rolle",
  },
}

const features = [
  {
    titleKey: "centralizedStorage",
    descriptionKey: "centralizedStorageDesc",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    bgColor: "bg-blue-600",
  },
  {
    titleKey: "advancedSearch",
    descriptionKey: "advancedSearchDesc",
    icon: <Search className="h-6 w-6 text-white" />,
    bgColor: "bg-blue-700",
  },
  {
    titleKey: "userManagement",
    descriptionKey: "userManagementDesc",
    icon: <Users className="h-6 w-6 text-white" />,
    bgColor: "bg-blue-800",
  },
  {
    titleKey: "fileManagement",
    descriptionKey: "fileManagementDesc",
    icon: <FileText className="h-6 w-6 text-white" />,
    bgColor: "bg-blue-900",
  },
]

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const t = translations[currentLanguage]

  useEffect(() => {
    // Check for user in localStorage or sessionStorage
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user")

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
      }
    }

    // Fetch current user from API
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
            // Update storage with latest user data
            if (localStorage.getItem("user")) {
              localStorage.setItem("user", JSON.stringify(data.user))
            } else {
              sessionStorage.setItem("user", JSON.stringify(data.user))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  const handleLanguageChange = (e) => {
    setCurrentLanguage(e.target.value)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        // Clear user data from storage
        localStorage.removeItem("user")
        sessionStorage.removeItem("user")
        setUser(null)

        toast.success("Logged out successfully")
        router.push("/")
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Error logging out. Please try again.")
    }
  }

  const getDashboardLink = () => {
    if (!user) return "/dashboard"

    switch (user.role) {
      case "admin":
        return "/dashboard/admin"
      case "supervisor":
        return "/dashboard/supervisor"
      default:
        return "/dashboard/student"
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <main className="repo-background">
      <div className="flex min-h-screen flex-col ">
      {/* Modern Navbar with glassmorphism */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-blue-500/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center group">
                <div className=" flex items-center gap-1">
                  <Image src={cugLogo} alt="logo image" width={34} height={34}/>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  CUG Repository
                </span>
                </div>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/"
                  className="relative text-blue-800 font-semibold hover:text-blue-600 transition-all duration-300 after:absolute after:bottom-[-8px] after:left-0 after:h-1 after:w-full after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 after:rounded-full after:shadow-lg after:shadow-blue-500/30"
                >
                  {t.home}
                </Link>
                <Link 
                  href="/about" 
                  className="text-slate-600 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105 relative after:absolute after:bottom-[-8px] after:left-1/2 after:w-0 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 after:rounded-full after:transition-all after:duration-300 hover:after:w-full hover:after:left-0"
                >
                  {t.about}
                </Link>
                <Link 
                  href="/contact" 
                  className="text-slate-600 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105 relative after:absolute after:bottom-[-8px] after:left-1/2 after:w-0 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 after:rounded-full after:transition-all after:duration-300 hover:after:w-full hover:after:left-0"
                >
                  {t.contact}
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="bg-white/70 backdrop-blur-sm text-slate-700 rounded-xl px-4 py-2 text-sm font-medium border border-slate-200/50 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300"
                value={currentLanguage}
                onChange={handleLanguageChange}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>

              {loading ? (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse shadow-inner"></div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:scale-105 transition-transform duration-200">
                      <Avatar className="h-12 w-12 border-3 border-gradient-to-br from-blue-400 to-indigo-500 cursor-pointer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300">
                        {user.profileImage ? (
                          <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.fullName} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800 font-bold text-lg">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-500/10 rounded-2xl" align="end" forceMount>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-2 p-2">
                        <p className="text-base font-semibold text-slate-800">
                          {t.welcomeBack}, {user.fullName}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">@{user.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="flex flex-col items-start p-4 hover:bg-blue-50/50 rounded-xl mx-2 my-1">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t.email}</span>
                        <span className="text-sm font-medium truncate w-full text-slate-700">{user.email}</span>
                      </DropdownMenuItem>
                      {user.indexNumber && (
                        <DropdownMenuItem className="flex flex-col items-start p-4 hover:bg-blue-50/50 rounded-xl mx-2 my-1">
                          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t.indexNumber}</span>
                          <span className="text-sm font-medium text-slate-700">{user.indexNumber}</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="flex flex-col items-start p-4 hover:bg-blue-50/50 rounded-xl mx-2 my-1">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t.role}</span>
                        <span className="text-sm font-medium capitalize text-slate-700">{user.role}</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    <DropdownMenuGroup>
                      <Link href={getDashboardLink()}>
                        <DropdownMenuItem className="cursor-pointer p-4 hover:bg-blue-50/50 rounded-xl mx-2 my-1 group">
                          <User className="mr-3 h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-medium">{t.dashboard}</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    <DropdownMenuItem className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50/50 p-4 rounded-xl mx-2 my-1 group" onClick={handleLogout}>
                      <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">{t.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5">
                    {t.login}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with enhanced gradients and animations */}
      <section className="w-full py-12 md:py-24 lg:py-8  relative overflow-hidden">
        {/* Animated background elements */}
        {/* <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl -z-10"></div> */}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
            <div className="lg:w-1/2 space-y-4">
              <span className="inline-block bg-gradient-to-r from-blue-100 via-blue-100 to-indigo-100 text-blue-800 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                {t.officialResource}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-black text-transparent bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-700 bg-clip-text leading-none tracking-tight">
                {t.title}
              </h1>
              <p className="text-xl md:text-xl text-slate-600 max-w-2xl font-medium leading-relaxed">
                {t.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                {!user && (
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group">
                      <Users className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      {t.registerNow}
                    </Button>
                  </Link>
                )}
                <Link href="#search-section">
                  <Button
                    variant="outline"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 group bg-white/50 backdrop-blur-sm"
                  >
                    <Search className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    {t.searchRepository}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center text-base text-slate-500 mt-8 bg-white/40 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/30 shadow-sm w-fit">
                <Clock className="mr-3 h-5 w-5 text-blue-600" />
                <span className="font-medium">{t.updatedRegularly}</span>
              </div>
            </div>

            {/* Enhanced Resources Card */}
            <div className="lg:w-1/2">
              <Card className="shadow-2xl border-0 overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <h3 className="text-xl font-bold flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Star className="h-6 w-6" />
                    </div>
                    {t.keyResources}
                  </h3>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    <div className="flex items-center gap-6 p-8 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 group cursor-pointer">
                      <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 p-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <FileText className="h-7 w-7 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">{t.pastExams}</h3>
                        <p className="text-slate-600 font-medium">{t.pastExamsDesc}</p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <div className="flex items-center gap-6 p-8 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 group cursor-pointer">
                      <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <GraduationCap className="h-7 w-7 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors duration-300">{t.thesesProjects}</h3>
                        <p className="text-slate-600 font-medium">{t.thesesProjectsDesc}</p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <div className="flex items-center gap-6 p-8 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 group cursor-pointer">
                      <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 p-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <Upload className="h-7 w-7 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors duration-300">{t.easySubmission}</h3>
                        <p className="text-slate-600 font-medium">{t.easySubmissionDesc}</p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Search Section */}
      <section id="search-section" className="w-full py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-blue-50/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 text-sm font-bold text-blue-800 mb-6 border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
              <Search className="mr-3 h-5 w-5" /> {t.exploreResources}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-700 bg-clip-text mb-6 tracking-tight">
              {t.browseRepository}
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              {t.exploreCollection}
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">
            <PublicSearch />
          </div>

          {!user && (
            <div className="text-center mt-16">
              <p className="text-xl text-slate-600 mb-8 font-medium">{t.moreFeatures}</p>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group">
                  <Users className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  {t.createAccount}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="w-full py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.3))]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 text-sm font-bold text-blue-800 mb-6 border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
              <Bookmark className="mr-3 h-5 w-5" /> {t.systemFeatures}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-700 bg-clip-text mb-6 tracking-tight">
              {t.featuresTitle}
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.titleKey} 
                className="group shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-xl border-white/30 rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-2 w-full bg-gradient-to-r ${feature.bgColor}`}></div>
                <CardContent className="p-8">
                  <div className={`bg-gradient-to-br ${feature.bgColor} rounded-2xl p-4 inline-flex mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                    {t[feature.titleKey]}
                  </h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {t[feature.descriptionKey]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.1))]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="flex items-center group">
                <div className=" mr-4 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105">
                  <Image src={cugLogo} alt="logo image" width={34} height={34}/>
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  CUG Repository
                </span>
              </div>
              <p className="text-slate-300 mb-6 font-medium leading-relaxed text-lg">
                {t.footerText}
              </p>
              <p className="text-slate-400 text-sm font-medium">
                {t.copyright}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-xl mb-6 text-white">
                {t.quickLinks}
              </h3>
              <div className="space-y-4">
                <Link href="/" className="text-slate-300 hover:text-white block transition-all duration-300 hover:translate-x-2 font-medium">
                  {t.home}
                </Link>
                <Link href="/about" className="text-slate-300 hover:text-white block transition-all duration-300 hover:translate-x-2 font-medium">
                  {t.about}
                </Link>
                <Link href="/contact" className="text-slate-300 hover:text-white block transition-all duration-300 hover:translate-x-2 font-medium">
                  {t.contact}
                </Link>
                <Link href="/register" className="text-slate-300 hover:text-white block transition-all duration-300 hover:translate-x-2 font-medium">
                  {t.registerNow}
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-xl mb-6 text-white">
                {t.legal}
              </h3>
              <div className="space-y-4">
                <Link href="/terms" className="text-slate-300 hover:text-white block transition-all duration-300 hover:translate-x-2 font-medium">
                  {t.terms}
                </Link>
                <Link href="/privacy" className="text-slate-300 hover:text-white block transition-all duration-300 hover:translate-x-2 font-medium">
                  {t.privacy}
                </Link>
                <Link href="/faq" className="text-slate-300 hover:text-white block transition-all duration-300 hover:translate-x-2 font-medium">
                  {t.faq}
                </Link>
                <Link href="/help" className="text-slate-300 hover:text-white block transition-all duration-300 hover:translate-x-2 font-medium">
                  {t.help}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </main>
  )
}