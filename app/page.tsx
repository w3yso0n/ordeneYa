"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { UtensilsCrossed, Store } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 space-y-4"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
          Orden<span className="text-sky-500">Eya</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Gestión de pedidos sencilla y rápida para negocios pequeños.
        </p>
        <Link href="/contacto">
          <Button variant="outline" className="mt-4 border-sky-200 hover:bg-sky-50 hover:border-sky-300">
            📍 Ver Ubicación y Contacto
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="h-full"
        >
          <Link href="/cliente" className="block h-full">
            <Card className="h-full border-2 hover:border-sky-500 transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-sky-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 group-hover:bg-sky-200 transition-colors">
                  <UtensilsCrossed className="w-10 h-10 text-sky-600" />
                </div>
                <CardTitle className="text-3xl">Soy Cliente</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg">
                  Quiero ordenar comida deliciosa de mis lugares favoritos.
                </CardDescription>
                <Button className="mt-6 w-full text-lg py-6" size="lg">
                  Ordenar Ahora
                </Button>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          className="h-full"
        >
          <Link href="/negocio" className="block h-full">
            <Card className="h-full border-2 hover:border-slate-800 transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-slate-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                  <Store className="w-10 h-10 text-slate-700" />
                </div>
                <CardTitle className="text-3xl">Soy Negocio</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg">
                  Quiero gestionar mis pedidos y controlar mi cocina.
                </CardDescription>
                <Button variant="secondary" className="mt-6 w-full text-lg py-6" size="lg">
                  Gestionar Pedidos
                </Button>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
