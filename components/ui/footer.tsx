import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/constants";

export function Footer() {
    return (
        <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Business Info */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                            {BUSINESS_INFO.name}
                        </h3>
                        <p className="text-slate-300 text-sm mb-4">
                            {BUSINESS_INFO.description}
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-sky-400" />
                            Contacto
                        </h4>
                        <div className="space-y-2 text-slate-300">
                            {BUSINESS_INFO.phones.map((phone, index) => (
                                <a
                                    key={index}
                                    href={`tel:+52${phone.number}`}
                                    className="block hover:text-sky-400 transition-colors"
                                >
                                    {phone.display}
                                </a>
                            ))}
                        </div>

                        <div className="mt-4">
                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-sky-400" />
                                Ubicación
                            </h5>
                            <a
                                href={BUSINESS_INFO.location.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-300 text-sm hover:text-sky-400 transition-colors block"
                            >
                                {BUSINESS_INFO.address.street}
                                <br />
                                {BUSINESS_INFO.address.neighborhood}
                                <br />
                                {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state}
                            </a>
                        </div>
                    </div>

                    {/* Hours */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-sky-400" />
                            Horarios
                        </h4>
                        <div className="space-y-1 text-sm text-slate-300">
                            <div className="flex justify-between">
                                <span>Lun - Jue:</span>
                                <span>{BUSINESS_INFO.hours.monday}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Viernes:</span>
                                <span>{BUSINESS_INFO.hours.friday}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sábado:</span>
                                <span>{BUSINESS_INFO.hours.saturday}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Domingo:</span>
                                <span>{BUSINESS_INFO.hours.sunday}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <h5 className="font-semibold text-sm mb-2 text-slate-300">💳 Transferencias</h5>
                            <p className="text-xs text-slate-400">{BUSINESS_INFO.bankAccount.bank}</p>
                            <p className="text-xs text-slate-400 font-mono mt-1">{BUSINESS_INFO.bankAccount.clabe}</p>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/contacto"
                                className="inline-block px-4 py-2 bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
                            >
                                Más Información
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-700 mt-8 pt-6 text-center text-sm text-slate-400">
                    <p>© {new Date().getFullYear()} {BUSINESS_INFO.name}. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
