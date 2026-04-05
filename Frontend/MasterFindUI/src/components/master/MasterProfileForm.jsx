import React, { useState, useEffect, useMemo } from 'react';
import '../../css/MasterProfileForm.css';
import { aiService } from '../../services/aiService';

const DEV_API_BASE_URL = 'https://localhost:7054'; 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? DEV_API_BASE_URL : '');


const MasterProfileForm = ({
    onSubmit,
    initialData = null,
    serviceCategories = [],
    locations = [],
    submitButtonText = "Kaydet"
}) => {
    const [formData, setFormData] = useState({
        description: '',
        companyName: '',
        yearsOfExperience: 0,
        taxNumber: '',
        serviceIds: [],
        locationIds: [],
    });
    const [profileImage, setProfileImage] = useState(null);
    const [certificateFile, setCertificateFile] = useState(null);
    const [loading, setLoading] = useState(false);




    const [aiLoading, setAiLoading] = useState(false);

    // --- AI BUTON FONKSİYONU ---
    const handleAiGenerate = async () => {


        const selectedServices = serviceCategories
            .filter(cat => cat.services)
            .flatMap(cat => cat.services)
            .filter(s => formData.serviceIds.includes(s.id))
            .map(s => s.name)
            .join(", ");


        const selectedCity = locations.find(l => formData.locationIds.includes(l.id))?.il || "Türkiye";

        // API'ye gidecek veri
        const payload = {
            jobTitle: "Usta",
            experienceYears: formData.yearsOfExperience || 1,
            city: selectedCity,
            skills: selectedServices || "Genel Tadilat"
        };

        setAiLoading(true);
        try {
            const res = await aiService.generateBio(payload);

            // Gelen veriyi Description alanına yazıyoruz bu kısımda
            setFormData(prev => ({
                ...prev,
                description: res.data.description
            }));

        } catch (err) {
            console.error("AI Hatası:", err);
            alert("AI metin oluştururken bir hata oluştu.");
        } finally {
            setAiLoading(false);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    // Düzenleme modunda, mevcut dosya URL'lerini göstermek için state'ler
    const [existingImageUrl, setExistingImageUrl] = useState('');
    const [existingCertUrl, setExistingCertUrl] = useState('');

    // Başlangıç verisi geldiğinde formu doldurmak için useEffect kullanıyoruz.
    useEffect(() => {
        if (initialData) {
            setFormData({
                description: initialData.description || '',
                companyName: initialData.companyName || '',
                yearsOfExperience: initialData.yearsOfExperience || 0,
                taxNumber: initialData.taxNumber || '',
                serviceIds: initialData.services?.map(s => s.id) || [],
                locationIds: initialData.locations?.map(l => l.id) || [],
            });
            setExistingImageUrl(initialData.profileImageUrl || '');
            setExistingCertUrl(initialData.certificateUrl || '');
        }
    }, [initialData]);

    const groupedLocations = useMemo(() => {
        return locations.reduce((acc, location) => {
            const { il, ilce, id } = location;
            if (!acc[il]) acc[il] = [];
            acc[il].push({ id, name: ilce });
            return acc;
        }, {});
    }, [locations]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e, field) => {
        const { value, checked } = e.target;
        const id = parseInt(value, 10);

        setFormData(prev => {
            const currentIds = prev[field];
            if (checked) {
                return { ...prev, [field]: [...currentIds, id] };
            } else {
                return { ...prev, [field]: currentIds.filter(item => item !== id) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submissionData = new FormData();
        Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key])) {
                formData[key].forEach(value => submissionData.append(key, value));
            } else {
                submissionData.append(key, formData[key]);
            }
        });

        if (profileImage) submissionData.append('profileImage', profileImage);
        if (certificateFile) submissionData.append('certificateFile', certificateFile);

        await onSubmit(submissionData);
        setLoading(false);
    };


    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-card">

                <div className="form-section">
                    <h3>Temel Bilgiler</h3>
                    <div className="form-group">
                        <label htmlFor="description">Hakkınızda (Açıklama)</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Kısaca mesleki tecrübelerinizden bahsedin..." />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="companyName">Firma Adı (varsa)</label>
                            <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Firma Adı" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="yearsOfExperience">Tecrübe (Yıl)</label>
                            <input type="number" id="yearsOfExperience" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} min="0" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="taxNumber">Vergi Numarası (varsa)</label>
                            <input type="text" id="taxNumber" name="taxNumber" value={formData.taxNumber} onChange={handleInputChange} placeholder="Vergi Numarası" />
                        </div>
                    </div>
                </div>


                <div className="form-section">
                    <h3>Hizmet Alanları ve Konumlar</h3>

                    {/* --- YENİ EKLENEN BÖLÜM BAŞLANGICI --- */}
                    {/* Sadece düzenleme modunda ve mevcut veri varsa bu bölümü göster */}
                    {initialData && (initialData.services?.length > 0 || initialData.locations?.length > 0) && (
                        <div className="current-selections-container">
                            <h4 className="current-selections-title">Mevcut Seçimleriniz</h4>
                            {initialData.services?.length > 0 && (
                                <div>
                                    <strong>Hizmetler:</strong>
                                    <div className="selection-tags-wrapper">
                                        {initialData.services.map(service => (
                                            <span key={service.id} className="selection-tag">{service.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {initialData.locations?.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <strong>Konumlar:</strong>
                                    <div className="selection-tags-wrapper">
                                        {initialData.locations.map(location => (
                                            <span key={location.id} className="selection-tag">{`${location.il} - ${location.ilce}`}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* --- YENİ EKLENEN BÖLÜM SONU --- */}


                    <div className="form-row">
                        <div className="form-group multi-select-container">
                            <label>Hizmetlerinizi Seçin veya Güncelleyin</label>
                            <div className="checkbox-group">
                                {serviceCategories.map(category => (
                                    <div key={category.id}>
                                        <h4 className="category-title">{category.name}</h4>
                                        {category.services.map(service => (
                                            <div key={service.id} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id={`service-${service.id}`}
                                                    value={service.id}
                                                    onChange={(e) => handleMultiSelectChange(e, 'serviceIds')}
                                                    checked={formData.serviceIds.includes(service.id)}
                                                />
                                                <label htmlFor={`service-${service.id}`}>{service.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group multi-select-container">
                            <label>Hizmet Bölgelerinizi Seçin veya Güncelleyin</label>
                            <div className="checkbox-group">
                                {Object.keys(groupedLocations).map(il => (
                                    <div key={il}>
                                        <h4 className="category-title">{il}</h4>
                                        {groupedLocations[il].map(ilce => (
                                            <div key={ilce.id} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id={`location-${ilce.id}`}
                                                    value={ilce.id}
                                                    onChange={(e) => handleMultiSelectChange(e, 'locationIds')}
                                                    checked={formData.locationIds.includes(ilce.id)}
                                                />
                                                <label htmlFor={`location-${ilce.id}`}>{ilce.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="form-section">
                    <h3>Dosyalar</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="profileImage">Profil Resmi</label>
                            {existingImageUrl && !profileImage && (
                                <div className="existing-file-preview">
                                    <img src={`${API_BASE_URL}${existingImageUrl}`} alt="Mevcut Profil Resmi" />
                                    <span>Mevcut Resim</span>
                                </div>
                            )}
                            <input type="file" id="profileImage" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="certificateFile">Ustalık Belgesi (PDF, JPG, PNG)</label>
                            {existingCertUrl && !certificateFile && (
                                <div className="existing-file-preview">
                                    <a href={`${API_BASE_URL}${existingCertUrl}`} target="_blank" rel="noopener noreferrer">Mevcut Belgeyi Görüntüle</a>
                                </div>
                            )}
                            <input type="file" id="certificateFile" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setCertificateFile(e.target.files[0])} />
                        </div>
                    </div>
                </div>

                {/* AÇIKLAMA ALANI VE AI BUTONU */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontWeight: 600 }}>Hakkımda / Açıklama</label>

                        {/* AI BUTONU */}
                        <button
                            type="button"
                            onClick={handleAiGenerate}
                            disabled={aiLoading}
                            className="ai-button"
                            style={{
                                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                color: 'white',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            {aiLoading ? (
                                <span>✨ Yazılıyor...</span>
                            ) : (
                                <>
                                    <span>✨</span> AI ile Yaz
                                </>
                            )}
                        </button>
                    </div>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontFamily: 'inherit'
                        }}
                        placeholder="Kendinizi tanıtın veya AI butonunu kullanarak otomatik oluşturun..."
                    />
                </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Kaydediliyor...' : submitButtonText}
            </button>
        </form>
    );
};
export default MasterProfileForm;
