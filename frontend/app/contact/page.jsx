"use client"

import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { BookOpen, Mail, Phone, MapPin, Send, ChevronDown } from "lucide-react"

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
      about: "About",
      login: "Log in",
    },
    contact: {
      title: "Contact Information",
      address: {
        label: "Address",
        value: "Catholic University of Ghana, Fiapre Campus, Sunyani, Bono Region, Ghana"
      },
      phone: {
        label: "Phone",
        value: "+233 (0) 54 123 4567"
      },
      email: {
        label: "Email",
        value: "repository@cug.edu.gh"
      }
    },
    form: {
      title: "Send Us a Message",
      name: {
        label: "Full Name",
        placeholder: "Enter your full name"
      },
      email: {
        label: "Email Address",
        placeholder: "Enter your email address"
      },
      subject: {
        label: "Subject",
        placeholder: "Enter message subject"
      },
      message: {
        label: "Message",
        placeholder: "Write your message here"
      },
      submit: "Send Message"
    },
    location: {
      title: "Our Location"
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
      about: "À propos",
      login: "Connexion",
    },
    contact: {
      title: "Informations de Contact",
      address: {
        label: "Adresse",
        value: "Université Catholique du Ghana, Campus de Fiapre, Sunyani, Région de Bono, Ghana"
      },
      phone: {
        label: "Téléphone",
        value: "+233 (0) 54 123 4567"
      },
      email: {
        label: "Email",
        value: "repository@cug.edu.gh"
      }
    },
    form: {
      title: "Envoyez-nous un Message",
      name: {
        label: "Nom Complet",
        placeholder: "Entrez votre nom complet"
      },
      email: {
        label: "Adresse Email",
        placeholder: "Entrez votre adresse email"
      },
      subject: {
        label: "Sujet",
        placeholder: "Entrez le sujet du message"
      },
      message: {
        label: "Message",
        placeholder: "Écrivez votre message ici"
      },
      submit: "Envoyer le Message"
    },
    location: {
      title: "Notre Emplacement"
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
      about: "Acerca de",
      login: "Iniciar Sesión",
    },
    contact: {
      title: "Información de Contacto",
      address: {
        label: "Dirección",
        value: "Universidad Católica de Ghana, Campus Fiapre, Sunyani, Región de Bono, Ghana"
      },
      phone: {
        label: "Teléfono",
        value: "+233 (0) 54 123 4567"
      },
      email: {
        label: "Correo Electrónico",
        value: "repository@cug.edu.gh"
      }
    },
    form: {
      title: "Envíenos un Mensaje",
      name: {
        label: "Nombre Completo",
        placeholder: "Ingrese su nombre completo"
      },
      email: {
        label: "Dirección de Correo Electrónico",
        placeholder: "Ingrese su dirección de correo electrónico"
      },
      subject: {
        label: "Asunto",
        placeholder: "Ingrese el asunto del mensaje"
      },
      message: {
        label: "Mensaje",
        placeholder: "Escriba su mensaje aquí"
      },
      submit: "Enviar Mensaje"
    },
    location: {
      title: "Nuestra Ubicación"
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
      about: "Sobre",
      login: "Entrar",
    },
    contact: {
      title: "Informações de Contato",
      address: {
        label: "Endereço",
        value: "Universidade Católica de Gana, Campus Fiapre, Sunyani, Região de Bono, Gana"
      },
      phone: {
        label: "Telefone",
        value: "+233 (0) 54 123 4567"
      },
      email: {
        label: "Email",
        value: "repository@cug.edu.gh"
      }
    },
    form: {
      title: "Envie-nos uma Mensagem",
      name: {
        label: "Nome Completo",
        placeholder: "Digite seu nome completo"
      },
      email: {
        label: "Endereço de Email",
        placeholder: "Digite seu endereço de email"
      },
      subject: {
        label: "Assunto",
        placeholder: "Digite o assunto da mensagem"
      },
      message: {
        label: "Mensagem",
        placeholder: "Escreva sua mensagem aqui"
      },
      submit: "Enviar Mensagem"
    },
    location: {
      title: "Nossa Localização"
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
      about: "Über uns",
      login: "Anmelden",
    },
    contact: {
      title: "Kontaktinformationen",
      address: {
        label: "Adresse",
        value: "Katholische Universität von Ghana, Fiapre Campus, Sunyani, Bono Region, Ghana"
      },
      phone: {
        label: "Telefon",
        value: "+233 (0) 54 123 4567"
      },
      email: {
        label: "E-Mail",
        value: "repository@cug.edu.gh"
      }
    },
    form: {
      title: "Senden Sie uns eine Nachricht",
      name: {
        label: "Vollständiger Name",
        placeholder: "Geben Sie Ihren vollständigen Namen ein"
      },
      email: {
        label: "E-Mail-Adresse",
        placeholder: "Geben Sie Ihre E-Mail-Adresse ein"
      },
      subject: {
        label: "Betreff",
        placeholder: "Geben Sie den Betreff der Nachricht ein"
      },
      message: {
        label: "Nachricht",
        placeholder: "Schreiben Sie Ihre Nachricht hier"
      },
      submit: "Nachricht senden"
    },
    location: {
      title: "Unser Standort"
    },
    footer: {
      copyright: "© 2024 Katholische Universität von Ghana. Alle Rechte vorbehalten.",
      terms: "Nutzungsbedingungen",
      privacy: "Datenschutzrichtlinie"
    }
  }
};

export default function ContactPage() {
  // Initialize language state with browser language or default to English
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [t, setT] = useState(translations.en);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData)
    // Could add toast notification or modal for success
    alert('Message sent successfully!')
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen flex flex-col">
      {/* Header with Language Switcher */}
      <header className="sticky top-0 z-50 w-full bg-white/80 shadow-md backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <Link href="/" className="text-2xl font-extrabold text-blue-800">CUG Repository</Link>
          </div>
          <nav className="flex flex-col md:flex-row items-center gap-6">
            <Link href="/" className="text-blue-700 hover:text-blue-900 transition-colors">
              {t.navigation.home}
            </Link>
            <Link href="/about" className="text-blue-700 hover:text-blue-900 transition-colors">
              {t.navigation.about}
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
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information Section */}
          <div className="bg-white rounded-xl shadow-2xl p-8 h-fit">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">{t.contact.title}</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{t.contact.address.label}</h3>
                  <p className="text-blue-700">
                    {t.contact.address.value}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{t.contact.phone.label}</h3>
                  <p className="text-blue-700">
                    {t.contact.phone.value}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{t.contact.email.label}</h3>
                  <p className="text-blue-700">
                    {t.contact.email.value}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">{t.form.title}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-blue-900 mb-2">{t.form.name.label}</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.form.name.placeholder}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-blue-900 mb-2">{t.form.email.label}</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.form.email.placeholder}
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-blue-900 mb-2">{t.form.subject.label}</label>
                <input 
                  type="text" 
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.form.subject.placeholder}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-blue-900 mb-2">{t.form.message.label}</label>
                <textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.form.message.placeholder}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Send className="h-5 w-5" />
                {t.form.submit}
              </button>
            </form>
          </div>
        </div>

        {/* Location Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">{t.location.title}</h2>
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.2412195160235!2d-2.3329367!3d7.3584653!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCatholic%20University%20of%20Ghana!5e0!3m2!1sen!2sgh!4v1683900000000!5m2!1sen!2sgh" 
              width="100%" 
              height="450" 
              style={{ border: 0 }}
              allowFullScreen 
              loading="lazy"
            ></iframe>
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