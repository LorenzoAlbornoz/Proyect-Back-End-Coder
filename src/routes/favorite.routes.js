import { Router } from 'express'
import { FavoriteController } from '../controllers/favoriteControllers.js'

const router = Router()
const favoriteController = new FavoriteController()

router.get('/favorite/:id', async (req, res) => {
  try {
    const favorite = await favoriteController.getFavoriteById(req.params.id);

    if (favorite) {
      res.send(favorite);
    } else {
      res.status(404).json({ error: 'El listado de favorito no existe' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el listado de favorito' });
  }
});

router.post('/favorite/:cid/product/:fid', async (req, res) => {
  const cartId = req.params.cid;
  const favoriteId = req.params.fid;
  const addProductResult = await favoriteController.addProductToFavorite(cartId, favoriteId);

  if (addProductResult !== null) {
    res.status(201).json({ data: addProductResult });
  } else {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

router.delete('/favorite/:fid/product/:pid', async (req, res) => {
  const favoriteId = req.params.fid;
  const productId = req.params.pid;

  try {
    const updatedFavorite = await favoriteController.deleteProductFromFavorite(favoriteId, productId);

    if (updatedFavorite !== null) {
      res.status(200).json({ data: updatedFavorite });
    } else {
      res.status(404).json({ error: 'El producto no está en el listado de favoritos' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto del listado de favoritos' });
  }
});

export default router