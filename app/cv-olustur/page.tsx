"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Code, 
  FileText,
  ArrowRight,
  ArrowLeft,
  Eye,
  Download,
  Save,
  Plus,
  Trash2,
  MessageSquare
} from "lucide-react"
import Navbar from "@/components/navbar"

interface CVData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    summary: string
    title?: string
  }
  education: Array<{
    id: string
    school: string
    degree: string
    field: string
    startDate: string
    endDate: string
    gpa?: string
  }>
  experience: Array<{
    id: string
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
  }>
  skills: Array<{
    id: string
    name: string
    level: string
  }>
  certifications: Array<{
    id: string
    name: string
    issuer: string
    date: string
  }>
  languages: Array<{
    id: string
    name: string
    level: string
  }>
}

export default function CVOlusturPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [modernSidebarColor, setModernSidebarColor] = useState<'blue' | 'teal' | 'purple' | 'rose' | 'green' | 'slate' | 'amber'>('blue')
  const previewRef = useRef<HTMLDivElement | null>(null)
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      summary: "",
      title: ""
    },
    education: [],
    experience: [],
    skills: [],
    certifications: []
    ,
    languages: []
  })

  const steps = [
    { id: 1, title: "Kişisel Bilgiler", icon: User },
    { id: 2, title: "Eğitim", icon: GraduationCap },
    { id: 3, title: "Deneyim", icon: Briefcase },
    { id: 4, title: "Yetenekler", icon: Code },
    { id: 5, title: "Sertifikalar", icon: Award },
    { id: 6, title: "Diller", icon: MessageSquare },
    { id: 7, title: "Önizleme", icon: Eye }
  ]

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updatePersonalInfo = (field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
  }

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: ""
    }
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }))
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: ""
    }
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }))
  }

  const updateExperience = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  const addSkill = () => {
    const newSkill = {
      id: Date.now().toString(),
      name: "",
      level: "Başlangıç"
    }
    setCvData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }))
  }

  const updateSkill = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }))
  }

  const removeSkill = (id: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }))
  }

  const addLanguage = () => {
    const newLanguage = {
      id: Date.now().toString(),
      name: "",
      level: "Başlangıç"
    }
    setCvData(prev => ({
      ...prev,
      languages: [...prev.languages, newLanguage]
    }))
  }

  const updateLanguage = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }))
  }

  const removeLanguage = (id: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }))
  }

  const addCertification = () => {
    const newCertification = {
      id: Date.now().toString(),
      name: "",
      issuer: "",
      date: ""
    }
    setCvData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }))
  }

  const updateCertification = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }))
  }

  const removeCertification = (id: string) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }))
  }

  const renderCVPreview = (isFinal: boolean = false) => {
    const renderTemplate = () => {
      switch (selectedTemplate) {
        case 'modern':
          return (
            <div className="cv-canvas bg-white p-0 shadow-lg w-[794px] h-[1123px]">
              {/* Two Column Layout */}
              <div className="grid grid-cols-3 gap-0 h-full">
                {/* Left Column - Sidebar flush to edges, spans full height */}
                <div
                  className="col-span-1 h-full px-6 py-8"
                  style={{
                    backgroundColor:
                      modernSidebarColor === 'blue'
                        ? 'rgba(0, 101, 248, 0.10)'
                        : modernSidebarColor === 'teal'
                        ? 'rgba(0, 255, 222, 0.12)'
                        : modernSidebarColor === 'purple'
                        ? 'rgba(124, 58, 237, 0.12)'
                        : modernSidebarColor === 'rose'
                        ? 'rgba(244, 63, 94, 0.12)'
                        : modernSidebarColor === 'green'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : modernSidebarColor === 'slate'
                        ? 'rgba(100, 116, 139, 0.12)'
                        : 'rgba(245, 158, 11, 0.12)'
                  }}
                >
                  {/* Profile Photo Placeholder */}
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>

                  {/* Contact */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">İletişim</h3>
                    <hr className="border-gray-300 mb-3" />
                    <div className="space-y-2 text-xs">
                      {cvData.personalInfo.phone && (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-2" />
                          {cvData.personalInfo.phone}
                        </div>
                      )}
                      {cvData.personalInfo.email && (
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-2" />
                          {cvData.personalInfo.email}
                        </div>
                      )}
                      {cvData.personalInfo.address && (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-2" />
                          {cvData.personalInfo.address}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {cvData.skills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Beceriler</h3>
                      <hr className="border-gray-300 mb-3" />
                      <ul className="space-y-1 text-xs">
                        {cvData.skills.map((skill) => (
                          <li key={skill.id} className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {skill.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Languages */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Diller</h3>
                    <hr className="border-gray-300 mb-3" />
                    <div className="space-y-1 text-xs">
                      <div>Türkçe / Ana Dil</div>
                      <div>İngilizce / Orta</div>
                    </div>
                  </div>

                  {/* References */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Referans</h3>
                    <hr className="border-gray-300 mb-3" />
                    <div className="space-y-1 text-xs">
                      <div>Referans 1</div>
                      <div>Referans 2</div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Main Content with inner padding */}
                <div className="col-span-2">
                  {/* Top Banner */}
                  <div className="w-full bg-[#2F2F30] text-white px-8 py-8">
                    <h1 className="mb-2" style={{fontFamily: 'Georgia, Times, serif', fontSize: '48px', fontWeight: 700, lineHeight: '1.1'}}>
                      {cvData.personalInfo.firstName || "Ad"} {cvData.personalInfo.lastName || "Soyad"}
                    </h1>
                    <p className="tracking-[0.25em] text-xs opacity-90 uppercase" style={{fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif'}}>
                      {cvData.personalInfo.title || 'Pozisyon'}
                    </p>
                  </div>

                  <div className="p-8">

                  {/* Summary */}
                  {cvData.personalInfo.summary && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide" style={{fontFamily: 'Georgia, Times, serif'}}>Özet</h2>
                      <hr className="border-gray-300 mb-3" />
                      <p className="text-xs text-gray-700 leading-relaxed break-words whitespace-pre-wrap">{cvData.personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {cvData.experience.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide" style={{fontFamily: 'Georgia, Times, serif'}}>İş Deneyimi</h2>
                      <hr className="border-gray-300 mb-3" />
                      {cvData.experience.map((exp) => (
                        <div key={exp.id} className="mb-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{exp.position}</h3>
                            {(() => {
                              const dateText = [exp.startDate, exp.endDate].filter(Boolean).join(' - ')
                              return dateText ? (
                                <span className="text-xs text-gray-500">{dateText}</span>
                              ) : null
                            })()}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{exp.company}</p>
                          {exp.description && (
                            <p className="text-xs text-gray-700 break-words whitespace-pre-wrap">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {cvData.education.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide" style={{fontFamily: 'Georgia, Times, serif'}}>Eğitim</h2>
                      <hr className="border-gray-300 mb-3" />
                      {cvData.education.map((edu) => (
                        <div key={edu.id} className="mb-3">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{edu.degree} - {edu.field}</h3>
                            {(() => {
                              const dateText = [edu.startDate, edu.endDate].filter(Boolean).join(' - ')
                              return dateText ? (
                                <span className="text-xs text-gray-500">{dateText}</span>
                              ) : null
                            })()}
                          </div>
                          <p className="text-xs text-gray-600">{edu.school}</p>
                          {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Certifications */}
                  {cvData.certifications.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide" style={{fontFamily: 'Georgia, Times, serif'}}>Sertifikalar</h2>
                      <hr className="border-gray-300 mb-3" />
                      {cvData.certifications.map((cert) => (
                        <div key={cert.id} className="mb-2">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{cert.name}</h3>
                            <span className="text-xs text-gray-500">{cert.date}</span>
                          </div>
                          <p className="text-xs text-gray-600">{cert.issuer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          )

        case 'classic':
          return (
            <div className="cv-canvas bg-white p-6 relative overflow-hidden w-[794px] h-[1123px] flex flex-col">
              {/* Background Shapes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200 rounded-full opacity-30 -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 rounded-full opacity-30 translate-y-12 -translate-x-12"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-200 rounded-full opacity-20"></div>

              {/* Header with Profile */}
              <div className="flex items-start mb-8 relative z-10">
                <div className="w-20 h-20 bg-pink-200 rounded-full mr-6 flex items-center justify-center">
                  <User className="w-10 h-10 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {cvData.personalInfo.firstName || "Ad"} {cvData.personalInfo.lastName || "Soyad"}
                  </h1>
                  <p className="text-sm text-gray-600 mb-3">{cvData.personalInfo.title || 'Pozisyon'}</p>
                  {cvData.personalInfo.summary && (
                      <p className="text-xs text-gray-700 leading-relaxed break-words whitespace-pre-wrap">{cvData.personalInfo.summary}</p>
                  )}
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-8 relative z-10">
                {/* Left Column */}
                <div>
                  {/* Experience */}
                  {cvData.experience.length > 0 && (
                    <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                      <h2 className="text-sm font-bold text-gray-900 mb-3">İş Deneyimi</h2>
                      {cvData.experience.map((exp) => (
                        <div key={exp.id} className="mb-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{exp.position}</h3>
                            <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{exp.company}</p>
                          {exp.description && (
                            <p className="text-xs text-gray-700">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {cvData.skills.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h2 className="text-sm font-bold text-gray-900 mb-3">Beceriler</h2>
                      {cvData.skills.map((skill) => (
                        <div key={skill.id} className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-700">{skill.name}</span>
                            <span className="text-xs text-gray-500">{skill.level}</span>
                          </div>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < (skill.level === 'Uzman' ? 5 : skill.level === 'İleri' ? 4 : skill.level === 'Orta' ? 3 : 2)
                                    ? 'bg-blue-500'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div>
                  {/* Education */}
                  {cvData.education.length > 0 && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg">
                      <h2 className="text-sm font-bold text-gray-900 mb-3">Eğitim</h2>
                      {cvData.education.map((edu) => (
                        <div key={edu.id} className="mb-3">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{edu.degree} - {edu.field}</h3>
                            <span className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</span>
                          </div>
                          <p className="text-xs text-gray-600">{edu.school}</p>
                          {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* References */}
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                    <h2 className="text-sm font-bold text-gray-900 mb-3">Referans</h2>
                    <div className="space-y-2 text-xs">
                      <div>Referans 1</div>
                      <div>Referans 2</div>
                      <div>Referans 3</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Footer - stick to bottom */}
              <div className="mt-auto p-4 bg-gray-50 rounded-lg flex justify-between items-center relative z-10 border-t border-gray-200">
                <div className="flex items-center text-xs">
                  <Mail className="w-3 h-3 mr-2" />
                  {cvData.personalInfo.email || "email@example.com"}
                </div>
                <div className="flex items-center text-xs">
                  <Phone className="w-3 h-3 mr-2" />
                  {cvData.personalInfo.phone || "+90 555 123 45 67"}
                </div>
              </div>
            </div>
          )

        case 'professional':
          return (
            <div className="cv-canvas bg-white w-[794px] h-[1123px]">
              <div className="px-8 pt-10 pb-4 text-center">
                <h1 className="text-4xl font-extrabold tracking-wide" style={{fontFamily: 'Georgia, Times, serif'}}>
                  {`${cvData.personalInfo.firstName || 'Ad'} ${cvData.personalInfo.lastName || 'Soyad'}`.toUpperCase()}
                </h1>
                <div className="mt-2 text-[11px] text-gray-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                  {cvData.personalInfo.address && <span>{cvData.personalInfo.address}</span>}
                  {(cvData.personalInfo.phone || cvData.personalInfo.email) && <span>•</span>}
                  {cvData.personalInfo.phone && <span>{cvData.personalInfo.phone}</span>}
                  {cvData.personalInfo.email && <span>• {cvData.personalInfo.email}</span>}
                </div>
                {cvData.personalInfo.title && (
                  <div className="mt-1 text-[10px] text-gray-600 italic">{cvData.personalInfo.title}</div>
                )}
              </div>

              <div className="px-8">
                {cvData.personalInfo.summary && (
                  <section className="mb-4">
                    <h2 className="text-[12px] font-extrabold tracking-wide text-gray-800">PROFESSIONAL SUMMARY</h2>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-[12px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{cvData.personalInfo.summary}</p>
                  </section>
                )}

                {cvData.skills.length > 0 && (
                  <section className="mb-4">
                    <h2 className="text-[12px] font-extrabold tracking-wide text-gray-800">TECHNICAL EXPERTISE</h2>
                    <hr className="my-1 border-gray-300" />
                    <div className="text-[12px] text-gray-800 leading-relaxed">
                      <div className="flex flex-wrap gap-x-2">
                        {cvData.skills.map(s => (
                          <span key={s.id} className="after:content-['•'] after:mx-2 last:after:content-['']">{s.name}</span>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {cvData.experience.length > 0 && (
                  <section className="mb-4">
                    <h2 className="text-[12px] font-extrabold tracking-wide text-gray-800">PROJECTS / EXPERIENCE</h2>
                    <hr className="my-1 border-gray-300" />
                    <div className="space-y-3">
                      {cvData.experience.map(exp => (
                        <div key={exp.id}>
                          <div className="text-[12px] font-semibold text-gray-900">
                            {exp.position}
                            {exp.company && <span className="font-normal text-gray-700"> — {exp.company}</span>}
                          </div>
                          <div className="text-[11px] text-gray-600">{[exp.startDate, exp.endDate].filter(Boolean).join(' - ')}</div>
                          {exp.description && (
                            <p className="text-[12px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words mt-1">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {cvData.education.length > 0 && (
                  <section className="mb-4">
                    <h2 className="text-[12px] font-extrabold tracking-wide text-gray-800">EDUCATION</h2>
                    <hr className="my-1 border-gray-300" />
                    <div className="space-y-2">
                      {cvData.education.map(edu => (
                        <div key={edu.id}>
                          <div className="text-[12px] font-semibold text-gray-900">{edu.school} — {edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
                          <div className="text-[11px] text-gray-600">{[edu.startDate, edu.endDate].filter(Boolean).join(' - ')}</div>
                          {edu.gpa && <div className="text-[11px] text-gray-600">GPA: {edu.gpa}</div>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {cvData.certifications.length > 0 && (
                  <section className="mb-4">
                    <h2 className="text-[12px] font-extrabold tracking-wide text-gray-800">CERTIFICATIONS</h2>
                    <hr className="my-1 border-gray-300" />
                    <div className="space-y-1">
                      {cvData.certifications.map(cert => (
                        <div key={cert.id} className="text-[12px] text-gray-800">
                          <span className="font-semibold">{cert.name}</span>
                          {cert.issuer && <span> — {cert.issuer}</span>}
                          {cert.date && <span className="text-[11px] text-gray-600"> • {cert.date}</span>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )

        

        default:
          return <div>Şablon bulunamadı</div>
      }
    }

    return (
      <div ref={previewRef}>
        <Card className={isFinal ? "h-fit" : "h-fit sticky top-24"}>
          <CardHeader className="print-hidden">
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              CV Önizleme - {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderTemplate()}
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDownloadPDF = useCallback(() => {
    if (!previewRef.current) return
    const printContents = previewRef.current.innerHTML

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.setAttribute('sandbox', 'allow-modals allow-same-origin allow-scripts')
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return
    // Clone existing styles (Tailwind + global) into print document
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => (el as HTMLElement).outerHTML)
      .join('')
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <meta charset="utf-8" />
          ${styles}
          <style>
            /* Full-bleed print: no outer margins */
            @page { size: A4; margin: 0; }
            html, body { height: 100%; }
            body { margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif; }
            /* Force the first child (our CV) to exactly A4 canvas */
            #print-root > * { width: 210mm; min-height: 297mm; margin: 0; padding: 14mm 16mm; box-sizing: border-box; background: #ffffff; }
            /* Remove any outer container constraints */
            /* Expand content to page width and remove container constraints */
            #print-root { width: 100%; margin: 0; padding: 0; }
            [class*="max-w-"], [class^="max-w-"] { max-width: 100% !important; }
            .mx-auto { margin-left: 0 !important; margin-right: 0 !important; }
            /* Remove card look on export */
            .card, [class*="shadow"], [class^="shadow"] { box-shadow: none !important; }
            .card, [class*="border"], [class^="border"], [class*="ring"], [class^="ring"] { border: 0 !important; box-shadow: none !important; outline: 0 !important; }
            [class*="rounded"], [class^="rounded"] { border-radius: 0 !important; }
            /* Utility helpers for layout in print */
            .flex { display: flex !important; }
            .flex-wrap { flex-wrap: wrap !important; }
            .justify-center { justify-content: center !important; }
            .items-center { align-items: center !important; }
            .gap-4 > * + * { margin-left: 1rem !important; }
            .space-y-1 > * + * { margin-top: 0.25rem !important; }
            .print-hidden { display: none !important; }
          </style>
        </head>
        <body>
          <div id="print-root">${printContents}</div>
        </body>
      </html>
    `)
    doc.close()

    // Print once when iframe content has loaded, then cleanup after printing
    const onLoad = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    }
    const cleanup = () => {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }, 200)
    }
    iframe.addEventListener('load', onLoad, { once: true })
    iframe.contentWindow?.addEventListener('afterprint', cleanup, { once: true } as any)
    // Fallback cleanup in case afterprint doesn't fire
    setTimeout(cleanup, 5000)
  }, [])

  // Client-side PDF export without print dialog (html2canvas + jsPDF)
  const handleExportClientPDF = useCallback(async () => {
    if (!previewRef.current) return
    const element = previewRef.current.querySelector('.cv-canvas') as HTMLElement || previewRef.current

    const [{ jsPDF }, htmlToImage] = await Promise.all([
      import('jspdf'),
      import('html-to-image')
    ])

    // A4 size in px at 96 DPI
    const pageWidthPx = 794
    const pageHeightPx = 1123

    let imgData: string | null = null
    try {
      imgData = await htmlToImage.toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      })
    } catch (e) {
      // Fallback: try html2canvas for environments where html-to-image fails
      try {
        const html2canvasModule = await import('html2canvas')
        const canvas = await html2canvasModule.default(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
        imgData = canvas.toDataURL('image/png')
      } catch {
        imgData = null
      }
    }
    if (!imgData) return

    const pdf = new jsPDF({ unit: 'px', format: [pageWidthPx, pageHeightPx] })

    const image = new Image()
    image.src = imgData
    await new Promise((res) => (image.onload = res))

    // If canvas size doesn't match A4, scale to fit width and paginate if taller.
    const imgWidth = pageWidthPx
    const imgHeight = (image.height * imgWidth) / image.width

    // If content height exceeds one page, paginate; otherwise single page.
    let yOffset = 0
    pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
    while (imgHeight - yOffset > pageHeightPx) {
      yOffset += pageHeightPx
      pdf.addPage([pageWidthPx, pageHeightPx], 'portrait')
      pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight)
    }

    pdf.save('cv.pdf')
  }, [])

  const renderStepContent = () => {
    switch (currentStep) {

      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kişisel Bilgiler</h2>
              <p className="text-gray-600">CV'nizin temel bilgilerini girin</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">Ad *</Label>
                <Input
                  id="firstName"
                  value={cvData.personalInfo.firstName}
                  onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                  placeholder="Adınızı girin"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Soyad *</Label>
                <Input
                  id="lastName"
                  value={cvData.personalInfo.lastName}
                  onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                  placeholder="Soyadınızı girin"
                />
              </div>
              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  value={cvData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={cvData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  placeholder="+90 555 123 45 67"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={cvData.personalInfo.address}
                  onChange={(e) => updatePersonalInfo("address", e.target.value)}
                  placeholder="Şehir, Ülke"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="title">Meslek / Ünvan</Label>
                <Input
                  id="title"
                  value={cvData.personalInfo.title || ''}
                  onChange={(e) => updatePersonalInfo("title", e.target.value)}
                  placeholder="Grafik ve Web Tasarımcısı, Yazılım Geliştirici..."
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="summary">Özet</Label>
                <Textarea
                  id="summary"
                  value={cvData.personalInfo.summary}
                  onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                  placeholder="Kendiniz hakkında kısa bir özet yazın..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Eğitim Geçmişi</h2>
              <p className="text-gray-600">Eğitim bilgilerinizi ekleyin</p>
            </div>

            {cvData.education.map((edu, index) => (
              <Card key={edu.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Eğitim #{index + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Okul/Üniversite *</Label>
                      <Input
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                        placeholder="Üniversite adı"
                      />
                    </div>
                    <div>
                      <Label>Derece *</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        placeholder="Lisans, Yüksek Lisans, vb."
                      />
                    </div>
                    <div>
                      <Label>Bölüm/Alan *</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                        placeholder="Bilgisayar Mühendisliği"
                      />
                    </div>
                    <div>
                      <Label>GPA</Label>
                      <Input
                        value={edu.gpa || ""}
                        onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                        placeholder="3.5/4.0"
                      />
                    </div>
                    <div>
                      <Label>Başlangıç Tarihi</Label>
                      <Input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Bitiş Tarihi</Label>
                      <Input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addEducation} variant="outline" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              Eğitim Ekle
            </Button>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">İş Deneyimi</h2>
              <p className="text-gray-600">Çalışma deneyimlerinizi ekleyin</p>
            </div>

            {cvData.experience.map((exp, index) => (
              <Card key={exp.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Deneyim #{index + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Şirket *</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        placeholder="Şirket adı"
                      />
                    </div>
                    <div>
                      <Label>Pozisyon *</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                        placeholder="Yazılım Geliştirici"
                      />
                    </div>
                    <div>
                      <Label>Başlangıç Tarihi</Label>
                      <Input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Bitiş Tarihi</Label>
                      <Input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Açıklama</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                      placeholder="Bu pozisyonda yaptığınız işleri açıklayın..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addExperience} variant="outline" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              Deneyim Ekle
            </Button>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Yetenekler</h2>
              <p className="text-gray-600">Teknik ve kişisel yeteneklerinizi ekleyin</p>
            </div>

            {cvData.skills.map((skill, index) => (
              <Card key={skill.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Label>Yetenek Adı</Label>
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                        placeholder="JavaScript, Python, React..."
                      />
                    </div>
                    <div className="w-32">
                      <Label>Seviye</Label>
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkill(skill.id, "level", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Başlangıç">Başlangıç</option>
                        <option value="Orta">Orta</option>
                        <option value="İleri">İleri</option>
                        <option value="Uzman">Uzman</option>
                      </select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(skill.id)}
                      className="text-red-500 hover:text-red-700 mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addSkill} variant="outline" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              Yetenek Ekle
            </Button>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sertifikalar</h2>
              <p className="text-gray-600">Aldığınız sertifikaları ekleyin</p>
            </div>

            {cvData.certifications.map((cert, index) => (
              <Card key={cert.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Label>Sertifika Adı</Label>
                      <Input
                        value={cert.name}
                        onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                        placeholder="AWS Certified Developer"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Kurum</Label>
                      <Input
                        value={cert.issuer}
                        onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                        placeholder="Amazon Web Services"
                      />
                    </div>
                    <div className="w-32">
                      <Label>Tarih</Label>
                      <Input
                        type="date"
                        value={cert.date}
                        onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertification(cert.id)}
                      className="text-red-500 hover:text-red-700 mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addCertification} variant="outline" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              Sertifika Ekle
            </Button>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Diller</h2>
              <p className="text-gray-600">Bildiğiniz dilleri ve seviyelerini ekleyin</p>
            </div>

            {cvData.languages.map((lang, index) => (
              <Card key={lang.id} className="relative">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Dil</Label>
                      <Input
                        value={lang.name}
                        onChange={(e) => updateLanguage(lang.id, "name", e.target.value)}
                        placeholder="İngilizce, Türkçe, Almanca..."
                      />
                    </div>
                    <div>
                      <Label>Seviye</Label>
                      <select
                        value={lang.level}
                        onChange={(e) => updateLanguage(lang.id, "level", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Başlangıç">Başlangıç</option>
                        <option value="Orta">Orta</option>
                        <option value="İleri">İleri</option>
                        <option value="Uzman">Uzman</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(lang.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addLanguage} variant="outline" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              Dil Ekle
            </Button>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">CV Önizleme</h2>
              <p className="text-gray-600">CV'nizin son halini kontrol edin</p>
            </div>

            

            {/* Duplicate full preview removed. Use the single preview below to avoid nested refs. */}

            <div className="flex justify-center space-x-4">
              <Button onClick={handleExportClientPDF} className="text-white" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}>
                <Download className="w-4 h-4 mr-2" />
                PDF İndir
              </Button>
              <Button variant="outline" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              CV{" "}
              <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #4300FF 0%, #0065F8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Oluştur
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Profesyonel CV'nizi kolayca oluşturun ve kariyerinizde fark yaratın
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "text-white shadow-lg"
                            : isCompleted
                            ? "text-white"
                            : "text-gray-400 bg-gray-200"
                        }`}
                        style={{
                          background: isActive || isCompleted 
                            ? 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'
                            : undefined
                        }}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </p>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-8 h-0.5 bg-gray-200 mx-4 hidden sm:block" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Layout based on current step */}
          {currentStep === 7 ? (
            /* Full width for final preview */
            <div>
              {/* Radio-style Template Selector visible on final preview */}
              <div className="max-w-4xl mx-auto mb-6 px-4">
                <fieldset className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Şablon Seçimi">
                  <legend className="sr-only">Şablon</legend>
                  
                  <label className={`cursor-pointer select-none px-4 py-2 rounded-full text-sm font-medium border ${selectedTemplate === 'professional' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    <input type="radio" name="template-final" value="professional" className="sr-only" checked={selectedTemplate === 'professional'} onChange={() => setSelectedTemplate('professional')} />
                    Professional
                  </label>
                  <label className={`cursor-pointer select-none px-4 py-2 rounded-full text-sm font-medium border ${selectedTemplate === 'modern' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    <input type="radio" name="template-final" value="modern" className="sr-only" checked={selectedTemplate === 'modern'} onChange={() => setSelectedTemplate('modern')} />
                    Modern
                  </label>
                  <label className={`cursor-pointer select-none px-4 py-2 rounded-full text-sm font-medium border ${selectedTemplate === 'classic' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    <input type="radio" name="template-final" value="classic" className="sr-only" checked={selectedTemplate === 'classic'} onChange={() => setSelectedTemplate('classic')} />
                    Klasik
                  </label>
                </fieldset>
                {selectedTemplate === 'modern' && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-sm text-gray-700">Sol Renk:</span>
                    {[
                      {key:'blue', ring:'ring-blue-600', border:'border-blue-600', bg:'linear-gradient(180deg, #4300FF 0%, #0065F8 100%)'},
                      {key:'teal', ring:'ring-teal-500', border:'border-teal-500', bg:'linear-gradient(180deg, #00FFDE 0%, #0065F8 100%)'},
                      {key:'purple', ring:'ring-purple-600', border:'border-purple-600', bg:'linear-gradient(180deg, #7C3AED 0%, #6366F1 100%)'},
                      {key:'rose', ring:'ring-rose-500', border:'border-rose-500', bg:'linear-gradient(180deg, #F43F5E 0%, #6366F1 100%)'},
                      {key:'green', ring:'ring-green-600', border:'border-green-600', bg:'linear-gradient(180deg, #10B981 0%, #059669 100%)'},
                      {key:'slate', ring:'ring-slate-600', border:'border-slate-600', bg:'linear-gradient(180deg, #64748B 0%, #334155 100%)'},
                      {key:'amber', ring:'ring-amber-500', border:'border-amber-500', bg:'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)'},
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        aria-label={opt.key}
                        onClick={() => setModernSidebarColor(opt.key as any)}
                        className={`w-8 h-8 rounded-full border ${modernSidebarColor === opt.key ? `ring-2 ${opt.ring} ${opt.border}` : 'border-gray-300'}`}
                        style={{background: opt.bg}}
                      />
                    ))}
                  </div>
                )}
              </div>

              {renderCVPreview(true)}
            </div>
          ) : (
            /* Single Column Layout for other steps (hide preview) */
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-5">
                <Card className="mb-8">
                  <CardContent className="p-8">
                    {renderStepContent()}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Geri
                  </Button>
                  
                  <div className="text-sm text-gray-500 flex items-center">
                    Adım {currentStep} / {steps.length}
                  </div>
                  
                  <Button
                    onClick={nextStep}
                    disabled={currentStep === steps.length}
                    className="text-white flex items-center"
                    style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}
                  >
                    İleri
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation for final step */}
          {currentStep === 7 && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              
              <div className="text-sm text-gray-500 flex items-center">
                Adım {currentStep} / {steps.length}
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={handleExportClientPDF} className="text-white" style={{background: 'linear-gradient(135deg, #4300FF 0%, #0065F8 100%)'}}>
                  <Download className="w-4 h-4 mr-2" />
                  PDF İndir
                </Button>
                <Button variant="outline" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
