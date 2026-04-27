"use client"

import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { BookOpen, Target, Users, Shield, Globe, Award, ChevronDown } from "lucide-react"

// Language data
const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "de", name: "Deutsch" },
]

// Translation content for each language
const translations = {
  en: {
    navigation: {
      home: "Home",
      contact: "Contact",
      login: "Log in",
    },
    about: {
      title: "About CUG Repository",
      subtitle: "A digital platform dedicated to preserving, organizing, and democratizing academic knowledge at the Catholic University of Ghana.",
      mission: {
        title: "Our Mission",
        content: "To provide a comprehensive, secure, and accessible digital repository that supports academic research, learning, and knowledge sharing."
      },
      vision: {
        title: "Our Vision",
        content: "To become a leading digital academic platform that empowers researchers, students, and educators through seamless knowledge access and collaboration."
      }
    },
    stats: {
      title: "Key Statistics",
      papers: "Research Papers",
      departments: "Academic Departments",
      users: "Registered Users",
      years: "Years of Academic Content"
    },
    features: {
      title: "Platform Features",
      security: {
        title: "Secure Storage",
        content: "Advanced security protocols ensure the protection of sensitive academic resources and user data."
      },
      collaboration: {
        title: "Collaborative Environment",
        content: "Facilitate academic collaboration through easy resource sharing and community interaction."
      },
      quality: {
        title: "Quality Assurance",
        content: "Rigorous review processes ensure the academic integrity and relevance of repository content."
      }
    },
    cta: {
      title: "Join Our Academic Community",
      content: "Discover, share, and collaborate on groundbreaking academic research and resources.",
      register: "Register Now",
      contact: "Contact Us"
    },
    footer: {
      copyright: "© 2024 Catholic University of Ghana. All rights reserved.",
      terms: "Terms of Service",
      privacy: "Privacy Policy"
    }
  },
  fr: {
    navigation: {
      home: "Accueil",
      contact: "Contact",
      login: "Connexion",
    },
    about: {
      title: "À propos du référentiel CUG",
      subtitle: "Une plateforme numérique dédiée à la préservation, l'organisation et la démocratisation des connaissances académiques à l'Université Catholique du Ghana.",
      mission: {
        title: "Notre Mission",
        content: "Fournir un dépôt numérique complet, sécurisé et accessible qui soutient la recherche académique, l'apprentissage et le partage des connaissances."
      },
      vision: {
        title: "Notre Vision",
        content: "Devenir une plateforme académique numérique de premier plan qui autonomise les chercheurs, les étudiants et les éducateurs grâce à un accès et une collaboration fluides aux connaissances."
      }
    },
    stats: {
      title: "Statistiques Clés",
      papers: "Articles de Recherche",
      departments: "Départements Académiques",
      users: "Utilisateurs Inscrits",
      years: "Années de Contenu Académique"
    },
    features: {
      title: "Fonctionnalités de la Plateforme",
      security: {
        title: "Stockage Sécurisé",
        content: "Des protocoles de sécurité avancés assurent la protection des ressources académiques sensibles et des données utilisateur."
      },
      collaboration: {
        title: "Environnement Collaboratif",
        content: "Faciliter la collaboration académique grâce à un partage facile des ressources et à l'interaction communautaire."
      },
      quality: {
        title: "Assurance Qualité",
        content: "Des processus de révision rigoureux garantissent l'intégrité et la pertinence académique du contenu du référentiel."
      }
    },
    cta: {
      title: "Rejoignez Notre Communauté Académique",
      content: "Découvrez, partagez et collaborez sur des recherches et des ressources académiques révolutionnaires.",
      register: "S'inscrire Maintenant",
      contact: "Contactez-nous"
    },
    footer: {
      copyright: "© 2024 Université Catholique du Ghana. Tous droits réservés.",
      terms: "Conditions d'Utilisation",
      privacy: "Politique de Confidentialité"
    }
  },
  es: {
    navigation: {
      home: "Inicio",
      contact: "Contacto",
      login: "Iniciar Sesión",
    },
    about: {
      title: "Acerca del Repositorio CUG",
      subtitle: "Una plataforma digital dedicada a preservar, organizar y democratizar el conocimiento académico en la Universidad Católica de Ghana.",
      mission: {
        title: "Nuestra Misión",
        content: "Proporcionar un repositorio digital completo, seguro y accesible que apoye la investigación académica, el aprendizaje y el intercambio de conocimientos."
      },
      vision: {
        title: "Nuestra Visión",
        content: "Convertirse en una plataforma académica digital líder que empodere a investigadores, estudiantes y educadores a través del acceso y la colaboración perfecta del conocimiento."
      }
    },
    stats: {
      title: "Estadísticas Clave",
      papers: "Artículos de Investigación",
      departments: "Departamentos Académicos",
      users: "Usuarios Registrados",
      years: "Años de Contenido Académico"
    },
    features: {
      title: "Características de la Plataforma",
      security: {
        title: "Almacenamiento Seguro",
        content: "Los protocolos de seguridad avanzados garantizan la protección de los recursos académicos sensibles y los datos de los usuarios."
      },
      collaboration: {
        title: "Entorno Colaborativo",
        content: "Facilitar la colaboración académica a través del fácil intercambio de recursos y la interacción comunitaria."
      },
      quality: {
        title: "Garantía de Calidad",
        content: "Los rigurosos procesos de revisión garantizan la integridad académica y la relevancia del contenido del repositorio."
      }
    },
    cta: {
      title: "Únase a Nuestra Comunidad Académica",
      content: "Descubra, comparta y colabore en investigaciones y recursos académicos innovadores.",
      register: "Regístrese Ahora",
      contact: "Contáctenos"
    },
    footer: {
      copyright: "© 2024 Universidad Católica de Ghana. Todos los derechos reservados.",
      terms: "Términos de Servicio",
      privacy: "Política de Privacidad"
    }
  },
  pt: {
    navigation: {
      home: "Início",
      contact: "Contato",
      login: "Entrar",
    },
    about: {
      title: "Sobre o Repositório CUG",
      subtitle: "Uma plataforma digital dedicada a preservar, organizar e democratizar o conhecimento acadêmico na Universidade Católica de Gana.",
      mission: {
        title: "Nossa Missão",
        content: "Fornecer um repositório digital abrangente, seguro e acessível que apoie a pesquisa acadêmica, o aprendizado e o compartilhamento de conhecimento."
      },
      vision: {
        title: "Nossa Visão",
        content: "Tornar-se uma plataforma acadêmica digital líder que capacite pesquisadores, estudantes e educadores por meio do acesso e colaboração perfeitos ao conhecimento."
      }
    },
    stats: {
      title: "Estatísticas Chave",
      papers: "Artigos de Pesquisa",
      departments: "Departamentos Acadêmicos",
      users: "Usuários Registrados",
      years: "Anos de Conteúdo Acadêmico"
    },
    features: {
      title: "Recursos da Plataforma",
      security: {
        title: "Armazenamento Seguro",
        content: "Protocolos de segurança avançados garantem a proteção de recursos acadêmicos sensíveis e dados de usuários."
      },
      collaboration: {
        title: "Ambiente Colaborativo",
        content: "Facilitar a colaboração acadêmica por meio do fácil compartilhamento de recursos e interação comunitária."
      },
      quality: {
        title: "Garantia de Qualidade",
        content: "Processos rigorosos de revisão garantem a integridade acadêmica e a relevância do conteúdo do repositório."
      }
    },
    cta: {
      title: "Junte-se à Nossa Comunidade Acadêmica",
      content: "Descubra, compartilhe e colabore em pesquisas e recursos acadêmicos inovadores.",
      register: "Registre-se Agora",
      contact: "Entre em Contato"
    },
    footer: {
      copyright: "© 2024 Universidade Católica de Gana. Todos os direitos reservados.",
      terms: "Termos de Serviço",
      privacy: "Política de Privacidade"
    }
  },
  de: {
    navigation: {
      home: "Startseite",
      contact: "Kontakt",
      login: "Anmelden",
    },
    about: {
      title: "Über das CUG-Repository",
      subtitle: "Eine digitale Plattform, die sich der Bewahrung, Organisation und Demokratisierung akademischen Wissens an der Katholischen Universität von Ghana widmet.",
      mission: {
        title: "Unsere Mission",
        content: "Ein umfassendes, sicheres und zugängliches digitales Repository bereitzustellen, das akademische Forschung, Lernen und Wissensaustausch unterstützt."
      },
      vision: {
        title: "Unsere Vision",
        content: "Eine führende digitale akademische Plattform zu werden, die Forscher, Studenten und Pädagogen durch nahtlosen Wissenszugang und Zusammenarbeit stärkt."
      }
    },
    stats: {
      title: "Schlüsselstatistiken",
      papers: "Forschungsarbeiten",
      departments: "Akademische Abteilungen",
      users: "Registrierte Benutzer",
      years: "Jahre akademischen Inhalts"
    },
    features: {
      title: "Plattformfunktionen",
      security: {
        title: "Sichere Speicherung",
        content: "Fortschrittliche Sicherheitsprotokolle gewährleisten den Schutz sensibler akademischer Ressourcen und Benutzerdaten."
      },
      collaboration: {
        title: "Kollaborative Umgebung",
        content: "Förderung der akademischen Zusammenarbeit durch einfachen Ressourcenaustausch und Gemeinschaftsinteraktion."
      },
      quality: {
        title: "Qualitätssicherung",
        content: "Strenge Überprüfungsprozesse gewährleisten die akademische Integrität und Relevanz der Repository-Inhalte."
      }
    },
    cta: {
      title: "Treten Sie Unserer Akademischen Gemeinschaft Bei",
      content: "Entdecken, teilen und arbeiten Sie an bahnbrechenden akademischen Forschungen und Ressourcen zusammen.",
      register: "Jetzt Registrieren",
      contact: "Kontaktieren Sie Uns"
    },
    footer: {
      copyright: "© 2024 Katholische Universität von Ghana. Alle Rechte vorbehalten.",
      terms: "Nutzungsbedingungen",
      privacy: "Datenschutzrichtlinie"
    }
  }
};

export default function AboutPage() {
  // Initialize language state with browser language or default to English
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [t, setT] = useState(translations.en);

  // Set initial language based on browser preference (if available)
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (translations[browserLang]) {
      setCurrentLanguage(browserLang);
      setT(translations[browserLang]);
    }
  }, []);

  // Update translations when language changes
  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    setT(translations[langCode]);
    setIsLanguageMenuOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen flex flex-col">
      {/* Header with Language Switcher */}
      <header className="sticky top-0 z-50 w-full bg-white/80 shadow-md backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <Link href="/" className="text-2xl font-extrabold text-blue-800"> CUG Repository</Link>
          </div>
          <nav className="flex flex-col md:flex-row items-center gap-6">
            <Link href="/" className="text-blue-700 hover:text-blue-900 transition-colors">
              {t.navigation.home}
            </Link>
            <Link href="/contact" className="text-blue-700 hover:text-blue-900 transition-colors">
              {t.navigation.contact}
            </Link>
            
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 text-blue-700 hover:text-blue-900 transition-colors"
              >
                {languages.find(lang => lang.code === currentLanguage)?.name}
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        currentLanguage === language.code ? 'bg-blue-100 text-blue-800' : 'text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {language.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {t.navigation.login}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 lg:py-24">
        {/* Mission & Vision Section */}
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-6">{t.about.title}</h1>
            <p className="text-xl text-blue-700 mb-6">
              {t.about.subtitle}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">{t.about.mission.title}</h3>
                  <p className="text-blue-700">
                    {t.about.mission.content}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Globe className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">{t.about.vision.title}</h3>
                  <p className="text-blue-700">
                    {t.about.vision.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">{t.stats.title}</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-4xl font-extrabold text-blue-600">500+</h3>
                <p className="text-blue-700">{t.stats.papers}</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-extrabold text-blue-600">50+</h3>
                <p className="text-blue-700">{t.stats.departments}</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-extrabold text-blue-600">1000+</h3>
                <p className="text-blue-700">{t.stats.users}</p>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-extrabold text-blue-600">10+</h3>
                <p className="text-blue-700">{t.stats.years}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-xl shadow-xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-12">{t.features.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">{t.features.security.title}</h3>
              <p className="text-blue-700">{t.features.security.content}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">{t.features.collaboration.title}</h3>
              <p className="text-blue-700">{t.features.collaboration.content}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">{t.features.quality.title}</h3>
              <p className="text-blue-700">{t.features.quality.content}</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-blue-600 text-white rounded-xl py-16 px-6">
          <h2 className="text-3xl font-bold mb-6">{t.cta.title}</h2>
          <p className="text-xl mb-8">
            {t.cta.content}
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              {t.cta.register}
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/20 transition-colors font-semibold"
            >
              {t.cta.contact}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-8 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-700 mb-4 md:mb-0">
            {t.footer.copyright}
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-blue-600 hover:underline">
              {t.footer.terms}
            </Link>
            <Link href="/privacy" className="text-blue-600 hover:underline">
              {t.footer.privacy}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}