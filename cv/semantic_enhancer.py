#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Semantic Enhancement for ATS Scoring
- SBERT for semantic similarity
- Skill normalization and grouping
- Advanced keyword matching
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple, Set
from collections import defaultdict
import numpy as np

# SBERT imports
try:
    from sentence_transformers import SentenceTransformer
    import torch
    SBERT_AVAILABLE = True
except ImportError:
    SBERT_AVAILABLE = False
    print("Warning: SBERT not available. Install: pip install sentence-transformers torch")

class SkillNormalizer:
    """Normalize and group similar skills"""
    
    def __init__(self):
        self.skill_groups = self._load_skill_groups()
        self.synonyms = self._load_synonyms()
    
    def _load_skill_groups(self) -> Dict[str, List[str]]:
        """Load skill groups from data or create default ones"""
        # Common skill groups
        return {
            "Python": ["python", "python3", "python programming", "py"],
            "JavaScript": ["javascript", "js", "node.js", "nodejs", "ecmascript"],
            "React": ["react", "reactjs", "react.js", "reactjs", "react native"],
            "AWS": ["aws", "amazon web services", "amazon aws", "cloud aws"],
            "Docker": ["docker", "docker container", "dockerization"],
            "SQL": ["sql", "mysql", "postgresql", "postgres", "database"],
            "Git": ["git", "github", "gitlab", "version control"],
            "Machine Learning": ["machine learning", "ml", "ai", "artificial intelligence"],
            "Data Science": ["data science", "data analysis", "data analytics"],
            "Project Management": ["project management", "pm", "agile", "scrum"],
            "Excel": ["excel", "microsoft excel", "spreadsheet"],
            "PowerPoint": ["powerpoint", "presentation", "slides"],
            "Word": ["word", "microsoft word", "document"],
            "Photoshop": ["photoshop", "adobe photoshop", "ps"],
            "Illustrator": ["illustrator", "adobe illustrator", "ai"],
            "Figma": ["figma", "ui design", "ux design"],
            "AutoCAD": ["autocad", "cad", "computer aided design"],
            "SolidWorks": ["solidworks", "3d modeling", "cad design"],
            "MATLAB": ["matlab", "mathematical modeling"],
            "Java": ["java", "java programming", "spring", "spring boot"],
            "C++": ["c++", "cpp", "c plus plus"],
            "C#": ["c#", "csharp", "dotnet", ".net"],
            "PHP": ["php", "php programming", "laravel"],
            "Angular": ["angular", "angularjs", "angular.js"],
            "Vue": ["vue", "vue.js", "vuejs"],
            "TypeScript": ["typescript", "ts", "type script"],
            "MongoDB": ["mongodb", "mongo", "nosql"],
            "Redis": ["redis", "cache", "caching"],
            "Kubernetes": ["kubernetes", "k8s", "container orchestration"],
            "Jenkins": ["jenkins", "ci/cd", "continuous integration"],
            "Linux": ["linux", "ubuntu", "centos", "unix"],
            "Windows": ["windows", "windows server", "microsoft windows"],
            "Azure": ["azure", "microsoft azure", "cloud azure"],
            "Google Cloud": ["google cloud", "gcp", "google cloud platform"],
            "Terraform": ["terraform", "infrastructure as code", "iac"],
            "Ansible": ["ansible", "configuration management"],
            "Elasticsearch": ["elasticsearch", "elastic", "search engine"],
            "Kibana": ["kibana", "data visualization", "dashboard"],
            "Tableau": ["tableau", "business intelligence", "bi"],
            "Power BI": ["power bi", "microsoft power bi", "business intelligence"],
            "SAP": ["sap", "sap erp", "enterprise resource planning"],
            "Salesforce": ["salesforce", "crm", "customer relationship management"],
            "Jira": ["jira", "project tracking", "issue tracking"],
            "Confluence": ["confluence", "documentation", "wiki"],
            "Slack": ["slack", "team communication", "collaboration"],
            "Zoom": ["zoom", "video conferencing", "remote meeting"],
            "Teams": ["teams", "microsoft teams", "collaboration"],
            "Office 365": ["office 365", "microsoft office", "productivity suite"]
        }
    
    def _load_synonyms(self) -> Dict[str, str]:
        """Load skill synonyms"""
        synonyms = {}
        for main_skill, variants in self.skill_groups.items():
            for variant in variants:
                synonyms[variant.lower()] = main_skill
        return synonyms
    
    def normalize_skill(self, skill: str) -> str:
        """Normalize a skill to its main form"""
        skill_lower = skill.lower().strip()
        return self.synonyms.get(skill_lower, skill)
    
    def extract_skills_from_text(self, text: str) -> List[str]:
        """Extract and normalize skills from text"""
        text_lower = text.lower()
        found_skills = []
        
        # Check for each skill group
        for main_skill, variants in self.skill_groups.items():
            for variant in variants:
                if re.search(rf'\b{re.escape(variant.lower())}\b', text_lower):
                    found_skills.append(main_skill)
                    break  # Avoid duplicates
        
        return list(set(found_skills))  # Remove duplicates

class SemanticMatcher:
    """SBERT-based semantic matching"""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self.cache = {}
        
        if SBERT_AVAILABLE:
            try:
                print(f"Loading SBERT model: {model_name}")
                self.model = SentenceTransformer(model_name)
                print("SBERT model loaded successfully")
            except Exception as e:
                print(f"SBERT model loading failed: {e}")
                self.model = None
        else:
            print("SBERT not available, using fallback matching")
    
    def _get_embedding(self, text: str) -> np.ndarray:
        """Get embedding for text with caching"""
        if text in self.cache:
            return self.cache[text]
        
        if self.model is not None:
            try:
                embedding = self.model.encode([text])[0]
                self.cache[text] = embedding
                return embedding
            except Exception as e:
                print(f"SBERT encoding error: {e}")
        
        # Fallback: return zero vector
        return np.zeros(384)  # all-MiniLM-L6-v2 dimension
    
    def similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        if not text1 or not text2:
            return 0.0
        
        # Fallback to keyword matching if SBERT not available
        if self.model is None:
            return self._keyword_similarity(text1, text2)
        
        try:
            emb1 = self._get_embedding(text1)
            emb2 = self._get_embedding(text2)
            
            # Cosine similarity
            similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
            return float(similarity)
        except Exception as e:
            print(f"Similarity calculation error: {e}")
            return self._keyword_similarity(text1, text2)
    
    def _keyword_similarity(self, text1: str, text2: str) -> float:
        """Fallback keyword-based similarity"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
    
    def find_similar_skills(self, target_skill: str, skill_list: List[str], threshold: float = 0.7) -> List[Tuple[str, float]]:
        """Find skills similar to target skill"""
        similar = []
        
        for skill in skill_list:
            similarity = self.similarity(target_skill, skill)
            if similarity >= threshold:
                similar.append((skill, similarity))
        
        return sorted(similar, key=lambda x: x[1], reverse=True)

class EnhancedKeywordMatcher:
    """Enhanced keyword matching with semantic similarity"""
    
    def __init__(self):
        self.skill_normalizer = SkillNormalizer()
        self.semantic_matcher = SemanticMatcher()
        self.sector_keywords = self._load_sector_keywords()
    
    def _load_sector_keywords(self) -> Dict[str, List[str]]:
        """Load sector keywords"""
        lex_path = Path("lexicons/sector_keywords.json")
        if lex_path.exists():
            try:
                return json.loads(lex_path.read_text(encoding="utf-8"))
            except Exception:
                pass
        
        # Fallback
        return {
            "INFORMATION-TECHNOLOGY": [
                "python", "java", "javascript", "react", "node", "api", "cloud",
                "docker", "kubernetes", "sql", "microservices", "aws", "azure"
            ],
            "FINANCE": [
                "budget", "forecast", "sap", "excel", "financial analysis",
                "audit", "ifrs", "tax", "valuation", "risk"
            ],
            "ENGINEERING": [
                "cad", "autocad", "solidworks", "mechanical", "electrical",
                "embedded", "matlab", "simulation", "qa", "testing"
            ],
            "HEALTHCARE": [
                "patient", "clinical", "hospital", "emr", "ehr", "compliance",
                "diagnosis", "treatment", "pharma", "laboratory"
            ],
            "ACCOUNTANT": [
                "bookkeeping", "ledger", "reconciliation", "payable", "receivable",
                "gst", "vat", "tax", "audit", "tally"
            ]
        }
    
    def enhanced_keyword_matching(self, cv_text: str, sector: str) -> Dict:
        """Enhanced keyword matching with semantic similarity"""
        sector_keywords = self.sector_keywords.get(sector, [])
        
        # Extract skills from CV
        cv_skills = self.skill_normalizer.extract_skills_from_text(cv_text)
        
        # Direct keyword matches
        direct_matches = []
        cv_text_lower = cv_text.lower()
        
        for keyword in sector_keywords:
            if re.search(rf'\b{re.escape(keyword.lower())}\b', cv_text_lower):
                direct_matches.append(keyword)
        
        # Semantic matches
        semantic_matches = []
        for keyword in sector_keywords:
            if keyword not in direct_matches:
                # Check semantic similarity with CV skills
                for cv_skill in cv_skills:
                    similarity = self.semantic_matcher.similarity(keyword, cv_skill)
                    if similarity >= 0.7:  # Threshold for semantic match
                        semantic_matches.append((keyword, cv_skill, similarity))
                        break
        
        # Calculate enhanced score
        direct_score = len(direct_matches)
        semantic_score = len(semantic_matches) * 0.8  # Semantic matches worth 80% of direct matches
        total_score = direct_score + semantic_score
        
        return {
            "direct_matches": direct_matches,
            "semantic_matches": semantic_matches,
            "cv_skills_found": cv_skills,
            "total_score": total_score,
            "enhancement_factor": 1.0 + (len(semantic_matches) * 0.1)  # Up to 30% boost
        }

def test_semantic_enhancement():
    """Test the semantic enhancement features"""
    print("Testing Semantic Enhancement...")
    
    # Test skill normalization
    normalizer = SkillNormalizer()
    test_skills = ["python3", "reactjs", "aws cloud", "docker container"]
    normalized = [normalizer.normalize_skill(skill) for skill in test_skills]
    print(f"Skill normalization: {test_skills} -> {normalized}")
    
    # Test semantic matching
    matcher = SemanticMatcher()
    similarity = matcher.similarity("machine learning", "artificial intelligence")
    print(f"Semantic similarity (ML vs AI): {similarity:.3f}")
    
    # Test enhanced keyword matching
    enhancer = EnhancedKeywordMatcher()
    test_cv = """
    I have experience with Python programming, React.js development, 
    AWS cloud services, and Docker containerization. I also worked with 
    machine learning and data science projects.
    """
    
    result = enhancer.enhanced_keyword_matching(test_cv, "INFORMATION-TECHNOLOGY")
    print(f"Enhanced matching result: {result}")

if __name__ == "__main__":
    test_semantic_enhancement()




