#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CV Analyzer Prototype - ATS Scoring System
Bu script mevcut CV dataset'ini analiz ederek skill'leri ve pattern'leri çıkarır
"""

import os
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import List, Dict, Set
import PyPDF2
import pdfplumber
from dataclasses import dataclass

@dataclass
class CVAnalysisResult:
    """CV analiz sonuçları için data class"""
    file_path: str
    sector: str
    text_content: str
    skills_found: List[str]
    sections: Dict[str, str]
    quality_score: float
    errors: List[str]

class CVAnalyzer:
    """Ana CV analiz sınıfı"""
    
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.skills_db = self._load_initial_skills()
        self.section_patterns = self._get_section_patterns()
        self.results = []
        
    def _load_initial_skills(self) -> Set[str]:
        """Başlangıç skill listesi - yaygın teknoloji ve beceriler"""
        return {
            # Programming Languages
            'Python', 'Java', 'JavaScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
            'TypeScript', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL',
            
            # Web Technologies
            'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express',
            'Django', 'Flask', 'Laravel', 'Spring', 'Bootstrap', 'jQuery',
            
            # Databases
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite',
            'ElasticSearch', 'Cassandra', 'DynamoDB',
            
            # Cloud & DevOps
            'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
            'Git', 'GitHub', 'GitLab', 'Terraform', 'Ansible',
            
            # Data Science & AI
            'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas',
            'NumPy', 'Scikit-learn', 'Tableau', 'Power BI', 'Apache Spark',
            
            # Business Skills
            'Project Management', 'Agile', 'Scrum', 'Kanban', 'Leadership',
            'Communication', 'Problem Solving', 'Team Management', 'Strategic Planning',
            
            # Finance & Accounting
            'Financial Analysis', 'Budgeting', 'SAP', 'QuickBooks', 'Excel',
            'Financial Modeling', 'Risk Management', 'Auditing', 'Taxation',
            
            # Design
            'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'InDesign', 'UI/UX',
            'Adobe Creative Suite', 'Canva', 'AutoCAD', '3D Modeling'
        }
    
    def _get_section_patterns(self) -> Dict[str, List[str]]:
        """CV'lerde yaygın bölüm başlıkları"""
        return {
            'experience': [
                r'work experience', r'professional experience', r'employment history',
                r'career history', r'work history', r'experience', r'employment',
                r'professional background', r'career summary', r'work summary'
            ],
            'education': [
                r'education', r'educational background', r'academic background',
                r'qualifications', r'academic qualifications', r'degrees',
                r'certifications', r'training', r'learning'
            ],
            'skills': [
                r'skills', r'technical skills', r'core competencies', r'abilities',
                r'expertise', r'proficiencies', r'competencies', r'technologies',
                r'technical expertise', r'key skills'
            ],
            'contact': [
                r'contact', r'contact information', r'personal information',
                r'personal details', r'contact details', r'reach me'
            ]
        }
    
    def parse_pdf(self, file_path: Path) -> str:
        """PDF dosyasından text çıkarır"""
        try:
            # pdfplumber ile dene (daha iyi format preservation)
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                return text.strip()
        except Exception as e1:
            try:
                # PyPDF2 ile fallback
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    return text.strip()
            except Exception as e2:
                print(f"PDF parsing hatası {file_path}: {e1}, {e2}")
                return ""
    
    def extract_skills(self, text: str) -> List[str]:
        """Text'ten skill'leri çıkarır"""
        found_skills = []
        text_lower = text.lower()
        
        for skill in self.skills_db:
            skill_lower = skill.lower()
            # Tam kelime eşleşmesi ara
            if re.search(r'\b' + re.escape(skill_lower) + r'\b', text_lower):
                found_skills.append(skill)
        
        return found_skills
    
    def detect_sections(self, text: str) -> Dict[str, str]:
        """CV'deki bölümleri tespit eder"""
        sections = {}
        text_lower = text.lower()
        lines = text.split('\n')
        
        for section_name, patterns in self.section_patterns.items():
            for pattern in patterns:
                matches = list(re.finditer(pattern, text_lower))
                if matches:
                    # İlk eşleşmeyi al
                    start_pos = matches[0].start()
                    # Bölüm başlangıcını satır bazında bul
                    char_count = 0
                    section_start_line = 0
                    for i, line in enumerate(lines):
                        if char_count >= start_pos:
                            section_start_line = i
                            break
                        char_count += len(line) + 1
                    
                    # Sonraki birkaç satırı al (basit implementation)
                    section_text = '\n'.join(lines[section_start_line:section_start_line+10])
                    sections[section_name] = section_text[:500]  # İlk 500 karakter
                    break
        
        return sections
    
    def calculate_quality_score(self, text: str, skills: List[str], sections: Dict[str, str]) -> float:
        """Basit kalite skoru hesaplar"""
        score = 0.0
        
        # Text uzunluğu (çok kısa veya çok uzun değil)
        text_len = len(text)
        if 500 <= text_len <= 3000:
            score += 20
        elif text_len > 3000:
            score += 10
        
        # Skill sayısı
        if len(skills) >= 5:
            score += 25
        elif len(skills) >= 3:
            score += 15
        elif len(skills) >= 1:
            score += 10
        
        # Bölüm varlığı
        required_sections = ['experience', 'education', 'skills']
        for section in required_sections:
            if section in sections:
                score += 15
        
        # Contact bilgisi varlığı
        if 'contact' in sections or '@' in text:
            score += 10
        
        # Email pattern kontrolü
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
            score += 5
        
        return min(score, 100.0)  # Max 100
    
    def analyze_cv(self, file_path: Path, sector: str) -> CVAnalysisResult:
        """Tek bir CV'yi analiz eder"""
        try:
            # PDF'i parse et
            text = self.parse_pdf(file_path)
            if not text:
                return CVAnalysisResult(
                    file_path=str(file_path), sector=sector, text_content="",
                    skills_found=[], sections={}, quality_score=0.0,
                    errors=["PDF parsing failed"]
                )
            
            # Skill'leri çıkar
            skills = self.extract_skills(text)
            
            # Bölümleri tespit et
            sections = self.detect_sections(text)
            
            # Kalite skoru hesapla
            quality_score = self.calculate_quality_score(text, skills, sections)
            
            return CVAnalysisResult(
                file_path=str(file_path), sector=sector, text_content=text[:1000],
                skills_found=skills, sections=sections, quality_score=quality_score,
                errors=[]
            )
            
        except Exception as e:
            return CVAnalysisResult(
                file_path=str(file_path), sector=sector, text_content="",
                skills_found=[], sections={}, quality_score=0.0,
                errors=[f"Analysis error: {str(e)}"]
            )
    
    def analyze_sector_sample(self, sector: str, sample_size: int = 10) -> List[CVAnalysisResult]:
        """Bir sektörden sample CV'leri analiz eder"""
        sector_dir = self.data_dir / sector
        if not sector_dir.exists():
            print(f"Sektör bulunamadı: {sector}")
            return []
        
        pdf_files = list(sector_dir.glob("*.pdf"))
        sample_files = pdf_files[:sample_size]
        
        print(f"\n🔍 {sector} sektöründen {len(sample_files)} CV analiz ediliyor...")
        
        results = []
        for i, file_path in enumerate(sample_files, 1):
            print(f"  {i}/{len(sample_files)}: {file_path.name}")
            result = self.analyze_cv(file_path, sector)
            results.append(result)
            self.results.append(result)
        
        return results
    
    def generate_sector_report(self, sector_results: List[CVAnalysisResult]) -> Dict:
        """Sektör bazında rapor oluşturur"""
        if not sector_results:
            return {}
        
        sector = sector_results[0].sector
        
        # Skill frequency
        all_skills = []
        for result in sector_results:
            all_skills.extend(result.skills_found)
        skill_counts = Counter(all_skills)
        
        # Average quality score
        avg_score = sum(r.quality_score for r in sector_results) / len(sector_results)
        
        # Common sections
        section_counts = Counter()
        for result in sector_results:
            section_counts.update(result.sections.keys())
        
        return {
            'sector': sector,
            'total_cvs_analyzed': len(sector_results),
            'average_quality_score': round(avg_score, 2),
            'top_skills': skill_counts.most_common(10),
            'common_sections': dict(section_counts),
            'sample_errors': [e for r in sector_results for e in r.errors if r.errors]
        }
    
    def save_results(self, filename: str = "cv_analysis_results.json"):
        """Sonuçları JSON olarak kaydet"""
        data = {
            'analysis_summary': {
                'total_cvs_analyzed': len(self.results),
                'sectors_analyzed': len(set(r.sector for r in self.results)),
                'total_unique_skills': len(set(skill for r in self.results for skill in r.skills_found))
            },
            'sector_reports': {},
            'detailed_results': []
        }
        
        # Sektör bazında grupla
        sector_groups = defaultdict(list)
        for result in self.results:
            sector_groups[result.sector].append(result)
        
        # Sektör raporları oluştur
        for sector, results in sector_groups.items():
            data['sector_reports'][sector] = self.generate_sector_report(results)
        
        # Detaylı sonuçlar (text content'i kısalt)
        for result in self.results:
            data['detailed_results'].append({
                'file_path': result.file_path,
                'sector': result.sector,
                'skills_found': result.skills_found,
                'sections': list(result.sections.keys()),
                'quality_score': result.quality_score,
                'errors': result.errors
            })
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 Analiz sonuçları kaydedildi: {filename}")

def main():
    """Ana fonksiyon - sample analiz"""
    
    # Veri dizini
    data_dir = "data"
    
    if not os.path.exists(data_dir):
        print(f"❌ Veri dizini bulunamadı: {data_dir}")
        return
    
    # Analyzer'ı başlat
    analyzer = CVAnalyzer(data_dir)
    
    # Test için birkaç sektör seç
    test_sectors = [
        'INFORMATION-TECHNOLOGY',
        'FINANCE', 
        'ENGINEERING',
        'HEALTHCARE',
        'ACCOUNTANT'
    ]
    
    print("🚀 CV Analiz Sistemi Başlatılıyor...")
    print(f"📁 Veri dizini: {data_dir}")
    
    # Her sektörden sample analiz et
    for sector in test_sectors:
        analyzer.analyze_sector_sample(sector, sample_size=5)
    
    # Sonuçları kaydet
    analyzer.save_results()
    
    # Özet rapor
    print("\n" + "="*50)
    print("📈 ANALİZ ÖZETİ")
    print("="*50)
    
    # Sektör bazında özet
    sector_groups = defaultdict(list)
    for result in analyzer.results:
        sector_groups[result.sector].append(result)
    
    for sector, results in sector_groups.items():
        report = analyzer.generate_sector_report(results)
        print(f"\n🏢 {sector}:")
        print(f"  📊 Analiz edilen CV: {report['total_cvs_analyzed']}")
        print(f"  ⭐ Ortalama kalite skoru: {report['average_quality_score']}/100")
        print(f"  🔧 En yaygın skill'ler: {', '.join([skill for skill, count in report['top_skills'][:5]])}")
    
    print(f"\n🎯 Toplam analiz edilen CV: {len(analyzer.results)}")
    print(f"🎯 Bulunan toplam unique skill: {len(set(skill for r in analyzer.results for skill in r.skills_found))}")

if __name__ == "__main__":
    main()

