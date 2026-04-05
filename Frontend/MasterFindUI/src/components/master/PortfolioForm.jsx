import React, { useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { masterService } from '../../services/masterService';
import '../../css/MasterPortfolioForm.css';

const PortfolioForm = ({ availableServices, onSuccess, onCancel }) => {
    const editorRef = useRef(null);

    const [description, setDescription] = useState('');
    const [serviceId, setServiceId] = useState('');

    const [rawImage, setRawImage] = useState(null);
    const [croppedImages, setCroppedImages] = useState([]);

    const [scale, setScale] = useState(1.2);
    const [rotate, setRotate] = useState(0);
    const [borderRadius, setBorderRadius] = useState(12);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setRawImage(file);
        setScale(1.2);
        setRotate(0);
        setError('');
    };

    const handleCropConfirm = () => {
        if (!editorRef.current) return;

        const canvas = editorRef.current.getImageScaledToCanvas();
        canvas.toBlob((blob) => {
            if (!blob) return;

            const file = new File(
                [blob],
                `portfolio-${Date.now()}.jpg`,
                { type: 'image/jpeg' }
            );

            setCroppedImages(prev => [...prev, file]);
            setRawImage(null);
        }, 'image/jpeg', 0.92);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!serviceId) {
            setError('Lütfen bir hizmet seçin.');
            return;
        }

        if (croppedImages.length === 0) {
            setError('Lütfen en az bir resim ekleyin.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('description', description);
        formData.append('serviceId', serviceId);

        croppedImages.forEach((img) => {
            formData.append('images', img);
        });

        try {
            await masterService.addPortfolioItem(formData);
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Portfolyo eklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portfolio-form-container">
            <form className="portfolio-form" onSubmit={handleSubmit}>
                <h3>Yeni Portfolyo Ekle</h3>

                {error && <div className="form-error">{error}</div>}

                <div className="form-group">
                    <label>İlgili Hizmet</label>
                    <select
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        required
                    >
                        <option value="">Hizmet seçiniz</option>
                        {availableServices.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Açıklama</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Yaptığınız işi kısaca açıklayın"
                        required
                    />
                </div>

                {!rawImage && (
                    <div className="form-group">
                        <label>Resim Seç</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                        />
                    </div>
                )}

                {rawImage && (
                    <div className="editor-card">
                        <AvatarEditor
                            ref={editorRef}
                            image={rawImage}
                            width={340}
                            height={220}
                            border={30}
                            borderRadius={borderRadius}
                            scale={scale}
                            rotate={rotate}
                        />

                        <div className="editor-controls">
                            <div>
                                <label>Yakınlaştır</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.1"
                                    value={scale}
                                    onChange={(e) => setScale(e.target.value)}
                                />
                            </div>

                            <div className="rotate-buttons">
                                <button type="button" onClick={() => setRotate(r => r - 90)}>⟲</button>
                                <button type="button" onClick={() => setRotate(r => r + 90)}>⟳</button>
                            </div>

                            <div>
                                <label>Köşe Yuvarlama</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={borderRadius}
                                    onChange={(e) => setBorderRadius(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="editor-actions">
                            <button
                                type="button"
                                className="submit-btn"
                                onClick={handleCropConfirm}
                            >
                                Onayla & Ekle
                            </button>

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setRawImage(null)}
                            >
                                Vazgeç
                            </button>
                        </div>
                    </div>
                )}

                {croppedImages.length > 0 && (
                    <div className="preview-list">
                        {croppedImages.map((img, i) => (
                            <img
                                key={i}
                                src={URL.createObjectURL(img)}
                                alt={`preview-${i}`}
                            />
                        ))}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Ekleniyor…' : 'Kaydet'}
                    </button>

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        İptal
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PortfolioForm;
