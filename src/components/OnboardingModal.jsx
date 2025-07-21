    import React from 'react';
    import { Button } from './ui/button';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
    import { Link } from 'react-router-dom';
    import { CheckCircle } from 'lucide-react'; // İkon için

    /**
     * OnboardingModal bileşeni, yeni kullanıcıları karşılar ve temel özellikleri tanıtır.
     * @param {boolean} isOpen - Modalın açık olup olmadığını kontrol eder.
     * @param {function} onClose - Modalı kapatmak için çağrılan fonksiyon.
     * @param {string} userName - Karşılanacak kullanıcının adı.
     */
    const OnboardingModal = ({ isOpen, onClose, userName }) => {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px] p-6">
                    <DialogHeader className="text-center">
                        {/* <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" /> */}
                        <img src="logo.webp" alt="KolayHosting Logo" className="h-16 w-16 mx-auto mb-4" />
                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                            KolayHosting'e Hoş Geldiniz, {userName}!
                        </DialogTitle>
                        <DialogDescription className="text-lg text-gray-700 dark:text-gray-300 mt-2">
                            Hosting planlarını karşılaştırmak için en doğru adresiniz.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Size en uygun hosting çözümünü bulmanıza yardımcı olmaktan mutluluk duyarız.
                            İşte başlayabileceğiniz birkaç şey:
                        </p>
                        <ul className="list-none space-y-3 text-left px-4">
                            <li className="flex items-center text-gray-800 dark:text-gray-200">
                                <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                                Binlerce hosting planını detaylıca **karşılaştırın**.
                            </li>
                            <li className="flex items-center text-gray-800 dark:text-gray-200">
                                <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                                Hosting sağlayıcıları ve özellikleri hakkında bilgi edinin.
                            </li>
                            <li className="flex items-center text-gray-800 dark:text-gray-200">
                                <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                                Sorularınız için AI asistanımızdan **yardım alın**.
                            </li>
                        </ul>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-6">
                        <Button asChild onClick={onClose} className="w-full sm:w-auto">
                            <Link to="/plans">Planları Keşfet</Link>
                        </Button>
                        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                            Daha Sonra Keşfet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default OnboardingModal;
    