'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Utensils, User, Users, Check, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger, DrawerClose, DrawerDescription } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Variante {
    id: number;
    nombre: string;
    precio: number;
    sku?: string;
    imagen?: string;
    activo: boolean;
}

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    imagen?: string;
    variantes?: Variante[];
}

interface CartItem {
    producto: Producto;
    cantidad: number;
    notas: string;
    varianteId?: number;
    varianteNombre?: string;
    precioCalculado?: number;
}

type OrderMode = 'waiter' | 'customer';

export default function ClientePage() {
    const router = useRouter();
    const [mode, setMode] = useState<OrderMode>('waiter');
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [metodoPago, setMetodoPago] = useState<string>('');

    // Business access state
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [password, setPassword] = useState('');

    // Options Modal State
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [optionsModalOpen, setOptionsModalOpen] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<string>('');

    useEffect(() => {
        api.get('/productos')
            .then((data) => {
                setProductos(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Error al cargar productos");
                setLoading(false);
            });
    }, []);

    const handleAddToCartClick = (producto: Producto) => {
        if (producto.variantes && producto.variantes.length > 0) {
            setSelectedProduct(producto);
            // Select first variant by default
            setSelectedVariantId(producto.variantes[0].id.toString());
            setOptionsModalOpen(true);
        } else {
            addToCart(producto);
        }
    };

    const confirmOptions = () => {
        if (!selectedProduct || !selectedVariantId) return;

        const variant = selectedProduct.variantes?.find(v => v.id.toString() === selectedVariantId);
        if (!variant) return;

        addToCart(selectedProduct, variant);
        setOptionsModalOpen(false);
        setSelectedProduct(null);
        setSelectedVariantId('');
    };

    const addToCart = (producto: Producto, variante?: Variante) => {
        setCart((prev) => {
            // Check if same product with same variant exists
            const existingIndex = prev.findIndex((item) => {
                if (item.producto.id !== producto.id) return false;
                if (variante && item.varianteId !== variante.id) return false;
                if (!variante && item.varianteId) return false;
                return true;
            });

            if (existingIndex >= 0) {
                toast.success(`Agregado otro ${producto.nombre}`);
                const newCart = [...prev];
                newCart[existingIndex].cantidad += 1;
                return newCart;
            }

            toast.success(`${producto.nombre} agregado al carrito`);
            return [...prev, {
                producto,
                cantidad: 1,
                notas: '',
                varianteId: variante?.id,
                varianteNombre: variante?.nombre,
                precioCalculado: variante ? variante.precio : producto.precio
            }];
        });
    };

    const removeFromCart = (index: number) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
        toast.info("Producto eliminado");
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart((prev) =>
            prev.map((item, i) => {
                if (i === index) {
                    const newQty = Math.max(1, item.cantidad + delta);
                    return { ...item, cantidad: newQty };
                }
                return item;
            })
        );
    };

    const handleSubmit = async () => {
        if (!nombre.trim()) {
            toast.error(mode === 'waiter' ? "Por favor ingresa el nombre del cliente" : "Por favor ingresa tu nombre");
            return;
        }
        if (cart.length === 0) return;

        setSubmitting(true);
        try {
            await api.post('/pedidos', {
                clienteNombre: nombre,
                tipo: 'LOCAL',
                metodoPago: metodoPago || null,
                items: cart.map((item) => ({
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    notas: item.notas,
                    varianteId: item.varianteId,
                    varianteNombre: item.varianteNombre,
                    precioCalculado: item.precioCalculado
                })),
            });
            setSuccessOpen(true);
            setCart([]);
            setNombre('');
            setMetodoPago('');
            setIsCartOpen(false);
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error("Hubo un error al enviar el pedido");
        } finally {
            setSubmitting(false);
        }
    };

    const total = cart.reduce((sum, item) => sum + (item.precioCalculado || item.producto.precio) * item.cantidad, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

    const getSelectedVariantPrice = () => {
        if (!selectedProduct || !selectedVariantId) return 0;
        const variant = selectedProduct.variantes?.find(v => v.id.toString() === selectedVariantId);
        return variant ? variant.precio : 0;
    };

    const handleBusinessAccess = () => {
        if (password === "chocoydani") {
            setShowPasswordDialog(false);
            setPassword("");
            router.push("/negocio");
        } else {
            toast.error("Contraseña incorrecta");
            setPassword("");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 pb-24">
            {/* Fixed Navbar */}
            <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-violet-100/50 z-40 px-4 h-16 flex items-center justify-between shadow-lg shadow-violet-100/20">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-violet-500 to-sky-500 p-2 rounded-xl shadow-lg">
                        <Utensils className="text-white w-5 h-5" />
                    </div>
                    <h1 className="font-bold text-xl bg-gradient-to-r from-violet-600 to-sky-600 bg-clip-text text-transparent">ElToldito</h1>
                </div>
                <div className="flex items-center gap-2">
                    {mode === 'waiter' && (
                        <Badge variant="secondary" className="text-sm bg-violet-100 text-violet-700 border-violet-200">Mesa 1</Badge>
                    )}
                    <Link href="/contacto">
                        <Button variant="ghost" size="sm" className="text-xs hover:bg-violet-50 hidden sm:flex">
                            📍 Contacto
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-xs hover:bg-violet-50 hidden sm:flex">
                            🏠 Inicio
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPasswordDialog(true)}
                        className="text-xs hover:bg-violet-50 hidden sm:flex gap-1"
                    >
                        <Store className="w-3 h-3" />
                        Negocio
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-violet-50"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingCart className="w-6 h-6 text-slate-700" />
                        {totalItems > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-gradient-to-br from-violet-500 to-sky-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg"
                            >
                                {totalItems}
                            </motion.span>
                        )}
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-24 max-w-5xl">
                {/* Mode Selector */}
                <div className="mb-8 flex justify-center">
                    <div className="inline-flex bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-violet-100/50">
                        <button
                            onClick={() => setMode('waiter')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${mode === 'waiter'
                                ? 'bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-lg shadow-violet-200'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Modo Mesero
                        </button>
                        <button
                            onClick={() => setMode('customer')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${mode === 'customer'
                                ? 'bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-lg shadow-violet-200'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            Modo Cliente
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-sky-600 bg-clip-text text-transparent">Menú</h2>
                    <p className="text-slate-600 mt-1">
                        {mode === 'waiter' ? 'Toma el pedido del cliente' : 'Selecciona tus platillos favoritos'}
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden border-violet-100/50">
                                <Skeleton className="h-48 w-full" />
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardFooter>
                                    <Skeleton className="h-10 w-full" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productos.map((producto, index) => (
                            <motion.div
                                key={producto.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <Card className="group overflow-hidden hover:shadow-2xl hover:shadow-violet-200/50 transition-all duration-300 border-violet-100/50 bg-white/80 backdrop-blur-sm h-full flex flex-col hover:-translate-y-1">
                                    <div className="aspect-video bg-gradient-to-br from-violet-100 to-sky-100 relative overflow-hidden">
                                        {producto.imagen ? (
                                            <img
                                                src={producto.imagen}
                                                alt={producto.nombre}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl text-violet-300">
                                                <Utensils />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl font-bold text-violet-600 shadow-lg border border-violet-100/50">
                                            ${producto.precio}
                                        </div>
                                        {producto.variantes && producto.variantes.length > 0 && (
                                            <div className="absolute bottom-3 left-3 bg-sky-500/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white shadow-lg">
                                                Variantes
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg text-slate-800">{producto.nombre}</CardTitle>
                                    </CardHeader>
                                    <CardFooter className="mt-auto pt-4">
                                        <Button
                                            className="w-full bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                                            onClick={() => handleAddToCartClick(producto)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Agregar
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Drawer */}
            <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DrawerContent className="bg-gradient-to-br from-violet-50/95 to-sky-50/95 backdrop-blur-xl border-violet-200/50">
                    <div className="mx-auto w-full max-w-lg">
                        <DrawerHeader>
                            <DrawerTitle className="text-3xl bg-gradient-to-r from-violet-600 to-sky-600 bg-clip-text text-transparent">
                                {mode === 'waiter' ? 'Pedido del Cliente' : 'Tu Pedido'}
                            </DrawerTitle>
                            <DrawerDescription className="text-slate-600">
                                {mode === 'waiter' ? 'Revisa los items antes de enviar a cocina' : 'Revisa tus items antes de ordenar'}
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                                {cart.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-12 text-slate-400"
                                    >
                                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-lg">El carrito está vacío</p>
                                    </motion.div>
                                ) : (
                                    cart.map((item, idx) => (
                                        <motion.div
                                            key={`${item.producto.id}-${idx}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            layout
                                            className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-violet-100/50 shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-900">{item.producto.nombre}</div>
                                                {item.varianteNombre && (
                                                    <div className="text-xs text-slate-500 mb-1">
                                                        <span className="bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded">
                                                            {item.varianteNombre}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="text-sm text-violet-600 font-medium">${item.precioCalculado || item.producto.precio} c/u</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-full border-violet-200 hover:bg-violet-50 hover:border-violet-300 transition-all"
                                                    onClick={() => updateQuantity(idx, -1)}
                                                >
                                                    <Minus className="w-3 h-3 text-violet-600" />
                                                </Button>
                                                <span className="w-8 text-center font-bold text-slate-900">{item.cantidad}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-full border-violet-200 hover:bg-violet-50 hover:border-violet-300 transition-all"
                                                    onClick={() => updateQuantity(idx, 1)}
                                                >
                                                    <Plus className="w-3 h-3 text-violet-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 ml-1 rounded-full transition-all"
                                                    onClick={() => removeFromCart(idx)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-4 border-t border-violet-200/50 bg-white/60 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-5">
                                <span className="text-xl font-semibold text-slate-700">Total</span>
                                <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-sky-600 bg-clip-text text-transparent">
                                    ${total}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <Input
                                    placeholder={mode === 'waiter' ? "Nombre del cliente" : "Tu nombre"}
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="text-lg py-6 border-violet-200 focus:border-violet-400 bg-white/80 backdrop-blur-sm rounded-xl"
                                />

                                <div className="grid grid-cols-3 gap-2">
                                    {['Efectivo', 'Tarjeta', 'Transferencia'].map((metodo) => (
                                        <button
                                            key={metodo}
                                            onClick={() => setMetodoPago(metodo === metodoPago ? '' : metodo)}
                                            className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${metodoPago === metodo
                                                ? 'bg-violet-100 border-violet-500 text-violet-700'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {metodo}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    className="w-full py-7 text-lg font-bold bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                                    disabled={cart.length === 0 || submitting}
                                    onClick={handleSubmit}
                                >
                                    {submitting ? 'Enviando...' : mode === 'waiter' ? 'Enviar a Cocina' : 'Realizar Pedido'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Options Selection Dialog */}
            <Dialog open={optionsModalOpen} onOpenChange={setOptionsModalOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">
                            {selectedProduct?.nombre}
                        </DialogTitle>
                        <DialogDescription>
                            Selecciona una variante
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto">
                        <RadioGroup
                            value={selectedVariantId}
                            onValueChange={setSelectedVariantId}
                        >
                            <div className="grid gap-2">
                                {selectedProduct?.variantes?.map((variante) => (
                                    <div key={variante.id} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedVariantId === variante.id.toString() ? 'border-sky-500 bg-sky-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value={variante.id.toString()} id={`v-${variante.id}`} />
                                            <Label htmlFor={`v-${variante.id}`} className="cursor-pointer font-medium">
                                                {variante.nombre}
                                            </Label>
                                        </div>
                                        <span className="text-sm font-bold text-sky-600">
                                            ${variante.precio}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
                        <div className="flex-1 flex justify-between items-center mb-2 sm:mb-0">
                            <span className="text-sm text-slate-500">Precio:</span>
                            <span className="text-xl font-bold text-slate-900">
                                ${getSelectedVariantPrice()}
                            </span>
                        </div>
                        <Button onClick={confirmOptions} className="bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto">
                            Agregar al Carrito
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={successOpen} onOpenChange={(open) => {
                setSuccessOpen(open);
                if (!open) router.push('/');
            }}>
                <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-violet-50/50 border-violet-200/50">
                    <DialogHeader>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="mx-auto bg-gradient-to-br from-green-400 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl"
                        >
                            <Utensils className="w-10 h-10 text-white" />
                        </motion.div>
                        <DialogTitle className="text-center text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ¡Pedido Recibido!
                        </DialogTitle>
                        <DialogDescription className="text-center text-lg pt-2 text-slate-600">
                            {mode === 'waiter' ? 'El pedido ha sido enviado a la cocina' : 'Tu orden ha sido enviada a la cocina'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all rounded-xl"
                            onClick={() => {
                                setSuccessOpen(false);
                                router.push('/');
                            }}
                        >
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Dialog for Business Access */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Acceso al Panel de Negocio</DialogTitle>
                        <DialogDescription>
                            Ingresa la contraseña para acceder al panel de administración
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleBusinessAccess()
                                }
                            }}
                            className="w-full"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowPasswordDialog(false)
                            setPassword("")
                        }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleBusinessAccess}>
                            Acceder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
