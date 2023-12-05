import Category from "../models/categorySchema.js"

export const getAllCategories = async (req, res) => {
    const categories = await Category.find();
    try {
      if (!categories) {
        return res.status(404).json({
          mensaje: "Categorias no encontradas",
          status: 404
        });
      }
  
      return res.status(200).json({
        mensaje: "Categorias encontrados",
        status: 200,
        categories
      });
    } catch (error) {
      return res.status(500).json({
        mensaje: "Hubo un error, inténtelo más tarde",
        status: 500
      });
    }
  };

export const createCategory = async (req, res) => {
    const { name } = req.body;
    const category = await Category.findOne({ name })

    try {
        if (category) {
            return res.status(404).json({
                mensaje: "Categoria ya existe",
            })
        }
        const newCategory = new Category({ name });
        await newCategory.save()

        return res.status(201).json({
            mensaje: "Categoria creada",
            status: 201,
            newCategory
        })
    } catch (error) {
        return res.status(500).json({
            mensaje: "Hubo un error, inténtelo más tarde",
            status: 500
        });
    }
}


export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    try {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          mensaje: "Id inválido",
          status: 400,
        });
      }
      if (!category) {
        return res.status(404).json({
          mensaje: "Categoria no encontrado",
          status: 404,
        });
      }
  
      return res.status(200).json({
        mensaje: "Categoria borrada correctamente",
        status: 200,
        category
      });
    } catch (error) {
      return res.status(500).json({
        mensaje: "Hubo un error, inténtelo más tarde",
        status: 500,
      });
    }
  };

