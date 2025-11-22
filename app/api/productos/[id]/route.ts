// app/api/productos/[id]/route.ts

import { NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// PATCH – update a product and its variants
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Await params first
    const { id: idString } = await params;
    const id = parseInt(idString);

    console.log('PATCH /api/productos/:id called');
    console.log('Updating product id:', id);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, precio, imagen, variantes } = body;

    const connection = await getConnection();
    try {
        await connection.beginTransaction();

        // Update base product info
        await connection.execute(
            'UPDATE productos SET nombre = ?, precio = ?, imagen = ? WHERE id = ?',
            [nombre, parseFloat(precio), imagen || null, id]
        );

        // Handle variants if provided
        if (variantes && Array.isArray(variantes)) {
            const [existingRows] = await connection.execute<RowDataPacket[]>(
                'SELECT id FROM producto_variantes WHERE productoId = ?',
                [id]
            );
            const existingIds = existingRows.map((v: any) => v.id);
            const incomingIds = variantes.filter((v: any) => v.id).map((v: any) => v.id);

            // Delete removed variants
            const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));
            if (toDelete.length > 0) {
                const placeholders = toDelete.map(() => '?').join(',');
                await connection.execute(
                    `DELETE FROM producto_variantes WHERE id IN (${placeholders})`,
                    toDelete
                );
            }

            // Upsert variants
            for (const variante of variantes) {
                if (variante.id) {
                    // Update existing variant
                    await connection.execute(
                        'UPDATE producto_variantes SET nombre = ?, precio = ?, sku = ?, imagen = ?, activo = ? WHERE id = ? AND productoId = ?',
                        [
                            variante.nombre,
                            parseFloat(variante.precio) || 0,
                            variante.sku || null,
                            variante.imagen || null,
                            variante.activo !== false ? 1 : 0,
                            variante.id,
                            id,
                        ]
                    );
                } else {
                    // Insert new variant
                    await connection.execute(
                        'INSERT INTO producto_variantes (productoId, nombre, precio, sku, imagen, activo) VALUES (?, ?, ?, ?, ?, ?)',
                        [
                            id,
                            variante.nombre,
                            parseFloat(variante.precio) || 0,
                            variante.sku || null,
                            variante.imagen || null,
                            variante.activo !== false ? 1 : 0,
                        ]
                    );
                }
            }
        }

        await connection.commit();
        console.log('Product updated successfully');
        return NextResponse.json({ message: 'Producto actualizado' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating producto:', error);
        return NextResponse.json({
            error: 'Error al actualizar producto',
            details: (error as any).message
        }, { status: 500 });
    } finally {
        connection.release();
    }
}

// DELETE – remove a product, its variants, and any order items
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('DELETE /api/productos/:id called');

    // Await params first
    const { id: idString } = await params;
    const id = parseInt(idString);

    console.log('Deleting product id:', id);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        console.log('Deleting related pedido_items...');
        await connection.execute('DELETE FROM pedido_items WHERE productoId = ?', [id]);

        console.log('Deleting related producto_variantes...');
        await connection.execute('DELETE FROM producto_variantes WHERE productoId = ?', [id]);

        console.log('Deleting product record...');
        const [result] = await connection.execute('DELETE FROM productos WHERE id = ?', [id]);

        await connection.commit();

        console.log('Product deleted successfully');
        return NextResponse.json({ message: 'Producto eliminado' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting producto:', error);
        return NextResponse.json(
            { error: 'Error al eliminar producto', details: (error as any).message },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}