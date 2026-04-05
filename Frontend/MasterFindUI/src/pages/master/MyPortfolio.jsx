import React, { useState, useEffect, useCallback } from 'react';
import { masterService } from '../../services/masterService';
import PortfolioForm from '../../components/master/PortfolioForm';
import '../../css/MyPortfolio.css';
import ConfirmModal from '../../components/shared/ConfirmModal';

const DEV_API_BASE_URL = 'https://localhost:7054';
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? DEV_API_BASE_URL : '');

const MyPortfolio = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [actionError, setActionError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const profileRes = await masterService.getMyProfile();
            setProfile(profileRes?.data ?? null);
        } catch (err) {
            console.error(err);
            setError('Portfolyo verileri yüklenemedi. Lütfen sayfayı yenileyin.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Silme işlemini başlat
    const startDeleteProcess = (id) => {
        setItemToDelete(id);
        setIsModalOpen(true);
        setActionError('');
    };

    // Silme işlemini onayla
    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await masterService.deletePortfolioItem(itemToDelete);
            setIsModalOpen(false);
            setItemToDelete(null);
            fetchData();
        } catch (err) {
            console.error(err);
            setActionError('Öğe silinirken bir hata oluştu.');
            setIsModalOpen(false);
        }
    };

    const handleFormSubmit = async () => {
        setShowForm(false);
        fetchData();
    };

    if (loading) {
        return <div className="portfolio-loading">Portfolyonuz Yükleniyor...</div>;
    }

    if (error) {
        return <div className="portfolio-error">{error}</div>;
    }

    const portfolioItems = profile?.portfolioItems ?? [];

    return (
        <div className="portfolio-container">
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Portfolyo Öğesini Sil"
                message="Bu portfolyo öğesini ve içindeki tüm resimleri kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
            />

            <div className="portfolio-header">
                <h1>Portfolyom</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="add-new-btn"
                    >
                        Yeni Portfolyo Ekle
                    </button>
                )}
            </div>

            {actionError && <p className="action-error">{actionError}</p>}

            {showForm && (
                <PortfolioForm
                    availableServices={profile?.services ?? []}
                    onSuccess={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <div className="portfolio-grid">
                {portfolioItems.length > 0 ? (
                    portfolioItems.map((item) => (
                        <div key={item.id} className="portfolio-card">
                            <div className="portfolio-image-slider">
                                {item.imageUrls?.[0] ? (
                                    <img
                                        src={`${API_BASE_URL}${item.imageUrls[0]}`}
                                        alt={item.description}
                                    />
                                ) : (
                                    <div className="no-image">Resim yok</div>
                                )}
                            </div>

                            <div className="portfolio-card-content">
                                <span className="service-tag">
                                    {item.serviceName}
                                </span>
                                <p className="description">
                                    {item.description}
                                </p>

                                <div className="portfolio-card-actions">
                                    <button
                                        onClick={() =>
                                            startDeleteProcess(item.id)
                                        }
                                        className="delete-btn"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    !showForm && (
                        <p className="no-portfolio-message">
                            Henüz portfolyonuza bir iş eklemediniz.
                        </p>
                    )
                )}
            </div>
        </div>
    );
};

export default MyPortfolio;
