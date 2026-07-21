import Product from '../models/Product.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

export async function getCategories(req, res) {
  try {
    const categories = await Category.find({});
    res.json(categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description,
      image_url: c.image_url
    })));
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
}

export async function getProducts(req, res) {
  const { category, search, sort } = req.query;

  try {
    const filter = {};

    // Filter by Category Name or ID
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const catObj = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
        if (catObj) {
          filter.category = catObj._id;
        } else {
          // If category not found by name, return empty result
          return res.json([]);
        }
      }
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { created_at: -1 };
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter).populate('category').sort(sortOption);

    const formattedProducts = products.map(p => {
      const primaryImg = p.images && p.images.length > 0
        ? (p.images.find(i => i.is_primary)?.image_url || p.images[0].image_url)
        : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600';

      return {
        id: p._id.toString(),
        category_id: p.category ? p.category._id.toString() : null,
        category_name: p.category ? p.category.name : 'Uncategorized',
        name: p.name,
        description: p.description,
        price: p.price,
        size_options: Array.isArray(p.size_options) ? p.size_options : ["XS", "S", "M", "L"],
        details: p.details,
        primary_image: primaryImg,
        images: p.images,
        created_at: p.created_at
      };
    });

    res.json(formattedProducts);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
}

export async function getProductById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id).populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const formattedImages = product.images.map((img, idx) => ({
      id: img._id ? img._id.toString() : idx + 1,
      image_url: img.image_url,
      is_primary: img.is_primary ? 1 : 0
    }));

    res.json({
      id: product._id.toString(),
      category_id: product.category ? product.category._id.toString() : null,
      category_name: product.category ? product.category.name : 'Uncategorized',
      name: product.name,
      description: product.description,
      price: product.price,
      size_options: Array.isArray(product.size_options) ? product.size_options : ["XS", "S", "M", "L"],
      details: product.details,
      images: formattedImages,
      created_at: product.created_at
    });
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

  try {
    let categoryObjId = null;
    if (mongoose.Types.ObjectId.isValid(category_id)) {
      categoryObjId = category_id;
    } else {
      const cat = await Category.findOne({ name: category_id });
      if (cat) categoryObjId = cat._id;
    }

    const formattedImages = [];
    if (images && images.length > 0) {
      const imgArray = Array.isArray(images) ? images : [images];
      imgArray.forEach((img, index) => {
        const url = typeof img === 'object' ? img.image_url : img;
        const isPrimary = typeof img === 'object' ? Boolean(img.is_primary) : (index === 0);
        formattedImages.push({ image_url: url, is_primary: isPrimary });
      });
    } else {
      formattedImages.push({
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
        is_primary: true
      });
    }

    const parsedSizes = typeof size_options === 'string' ? JSON.parse(size_options) : (Array.isArray(size_options) ? size_options : ["XS", "S", "M", "L"]);

    const product = new Product({
      category: categoryObjId,
      name,
      description: description || '',
      price: Number(price),
      size_options: parsedSizes,
      details: details || '',
      images: formattedImages
    });

    await product.save();

    res.status(201).json({ message: 'Product created successfully', productId: product._id.toString() });
  } catch (error) {
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

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateFields = {
      name,
      description: description || '',
      price: Number(price),
      details: details || ''
    };

    if (mongoose.Types.ObjectId.isValid(category_id)) {
      updateFields.category = category_id;
    }

    if (size_options) {
      updateFields.size_options = typeof size_options === 'string' ? JSON.parse(size_options) : size_options;
    }

    if (images) {
      const imgArray = Array.isArray(images) ? images : [images];
      updateFields.images = imgArray.map((img, index) => ({
        image_url: typeof img === 'object' ? img.image_url : img,
        is_primary: typeof img === 'object' ? Boolean(img.is_primary) : (index === 0)
      }));
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
}

export async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
}
