import Product from '../models/productSchema.js'
import cloudinary from 'cloudinary'

export const getAllProducts = async (req, res) => {
    const products = await Product.find().populate("category")

    try {
        if (!products) {
            return res.status(404).json({
                mensaje: "Productos no encontrados",
                status: 404
            });
        }

        return res.status(200).json({
            mensaje: "Productos encontrados",
            status: 200,
            products
        });

    } catch {
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500
        })
    }
}


export const getProductByID = async (req, res) => {
    const { _id } = req.params;
    const product = await Product.findById(_id).populate("category");
    try {
        if (!product) {
            return res.status(404).json({
                mensaje: "Producto no encontrado",
                status: 404,
            });
        }

        return res.status(200).json({
            mensaje: "Producto encontrado",
            status: 200,
            product
        });
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500
        });
    }
};

export const createProduct = async (req, res) => {
    const { title, description, price, category, code, stock, } = req.body;
    const {path} = req.file;
    const product = await Product.findOne({ title });
    const cloudImg = await cloudinary.uploader.upload(path);

    try {
        if (product) {
            return res.status(400).json({
                mensaje: "El Producto ya existe",
                status: 400
            })
        }
        const newProduct = new Product({
            title,
            description,
            price,
            category,
            image: cloudImg.secure_url,
            code,
            stock
        })
        await newProduct.save();

        return res.status(201).json({
            mensaje: "Producto creado correctamente",
            status: 201,
            newProduct
        })
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500
        })
    }
}


export const deleteProduct = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Obtén el producto antes de eliminarlo
      const productToDelete = await Product.findById(id);
  
      if (!productToDelete) {
        return res.status(404).json({
          mensaje: "Producto no encontrado",
          status: 404,
        });
      }
  
      // Elimina la imagen de Cloudinary si existe
      if (productToDelete.image) {
        const public_id = productToDelete.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(public_id);
      }
  
      // Elimina el producto de la base de datos
      const deletedProduct = await Product.findByIdAndDelete(id);
  
      return res.status(200).json({
        mensaje: "Producto borrado correctamente",
        status: 200,
        product: deletedProduct,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensaje: "Hubo un error, inténtelo más tarde",
        status: 500,
      });
    }
  };

 export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, category, code, stock, } = req.body;
    const {path} = req.file;
    
    try {
        const existingProduct = await Product.findById(id);
    
        if (!existingProduct) {
          return res.status(404).json({
            mensaje: "Producto no encontrado",
            status: 404
          });
        }
    
        // Eliminar imagen anterior en Cloudinary
        if (existingProduct.image) {
          const public_id = existingProduct.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(public_id);
        }
    
        const cloudImg = await cloudinary.uploader.upload(path);

    const product = await Product.findByIdAndUpdate( id,{
        title,
        description,
        price,
        category,
        image: cloudImg.secure_url,
        code,
        stock
    }, { new: true });
    if (!product) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
        status: 404
      });
    }
  
    return res.status(200).json({
      mensaje: "Producto modificado correctamente",
      status: 200,
      product
    });
    } catch (error) {
      return res.status(500).json({
        mensaje: "Hubo un error, inténtelo más tarde",
        status: 500
      });
    }
  };

