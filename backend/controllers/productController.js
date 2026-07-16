import pool from '../db.js';

export async function getCategories(req, res) {
  try {
    const [categories] = await pool.execute('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
}

export async function getProducts(req, res) {
  const { category, search, sort } = req.query;

  try {
    let sql = `
      SELECT p.*, c.name AS category_name, pi.image_url AS primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    `;
    const params = [];
    const conditions = [];

    // Filter by Category Name or ID
    if (category) {
      if (isNaN(category)) {
        conditions.push('c.name = ?');
      } else {
        conditions.push('p.category_id = ?');
      }
      params.push(category);
    }

    // Search filter
    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    if (sort === 'price-asc') {
      sql += ' ORDER BY p.price ASC';
    } else if (sort === 'price-desc') {
      sql += ' ORDER BY p.price DESC';
    } else {
      sql += ' ORDER BY p.created_at DESC';
    }

    const [products] = await pool.execute(sql, params);
    
    // Parse size_options if they are returned as string
    const formattedProducts = products.map(p => ({
      ...p,
      size_options: typeof p.size_options === 'string' ? JSON.parse(p.size_options) : p.size_options
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
}

export async function getProductById(req, res) {
  const { id } = req.params;

  try {
    const [products] = await pool.execute(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [images] = await pool.execute(`
      SELECT id, image_url, is_primary FROM product_images WHERE product_id = ?
    `, [id]);

    const product = products[0];
    product.images = images;
    product.size_options = typeof product.size_options === 'string' ? JSON.parse(product.size_options) : product.size_options;

    res.json(product);
  } catch (error) {
    console.error('Fetch product by id error:', error);
    res.status(500).json({ message: 'Server error fetching product details' });
  }
}

export async function createProduct(req, res) {
  const { category_id, name, description, price, size_options, details, images } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Name, price, and category are required' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const sizesString = Array.isArray(size_options) ? JSON.stringify(size_options) : size_options || '["XS","S","M","L"]';
    
    // 1. Insert product
    const [productResult] = await connection.execute(
      'INSERT INTO products (category_id, name, description, price, size_options, details) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id, name, description || '', price, sizesString, details || '']
    );

    const productId = productResult.insertId;

    // 2. Insert images
    if (images && images.length > 0) {
      const imgArray = Array.isArray(images) ? images : [images];
      for (let i = 0; i < imgArray.length; i++) {
        const imgUrl = typeof imgArray[i] === 'object' ? imgArray[i].image_url : imgArray[i];
        const isPrimary = typeof imgArray[i] === 'object' ? (imgArray[i].is_primary ? 1 : 0) : (i === 0 ? 1 : 0);
        
        await connection.execute(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [productId, imgUrl, isPrimary]
        );
      }
    } else {
      // Insert placeholder
      await connection.execute(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
        [productId, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600', 1]
      );
    }

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'Product created successfully', productId });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { category_id, name, description, price, size_options, details, images } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Name, price, and category are required' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const sizesString = Array.isArray(size_options) ? JSON.stringify(size_options) : size_options || '["XS","S","M","L"]';

    // 1. Update product details
    const [result] = await connection.execute(
      'UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, size_options = ?, details = ? WHERE id = ?',
      [category_id, name, description || '', price, sizesString, details || '', id]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Update images if provided
    if (images) {
      // Clear old images
      await connection.execute('DELETE FROM product_images WHERE product_id = ?', [id]);

      const imgArray = Array.isArray(images) ? images : [images];
      for (let i = 0; i < imgArray.length; i++) {
        const imgUrl = typeof imgArray[i] === 'object' ? imgArray[i].image_url : imgArray[i];
        const isPrimary = typeof imgArray[i] === 'object' ? (imgArray[i].is_primary ? 1 : 0) : (i === 0 ? 1 : 0);

        await connection.execute(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [id, imgUrl, isPrimary]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
}

export async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
}

