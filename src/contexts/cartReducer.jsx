import React, { createContext, useContext, useReducer, useEffect } from 'react';


const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  UPDATE_PRICE: 'UPDATE_PRICE',
  UPDATE_DISCOUNT: 'UPDATE_DISCOUNT',
  UPDATE_DISCOUNT_FBU: 'UPDATE_DISCOUNT_FBU', 
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  SET_LOADING: 'SET_LOADING'
};

const getStockProductId = (product) => (
  product?.stock_product_id
  ?? product?.stockProductId
  ?? product?.id
  ?? product?.product_id
);

const getRealProductId = (product) => (
  product?.real_product_id
  ?? product?.realProductId
  ?? product?.product?.id
  ?? (product?.stock_product_id || product?.id ? product?.product_id : null)
);

const getCartItemId = (item) => item?.stock_product_id ?? item?.product_id;


const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product } = action.payload;
      const stockProductId = getStockProductId(product);
      const realProductId = getRealProductId(product);

      console.log('[Cart][ADD_ITEM] Produit sélectionné:', {
        product,
        stockProductId,
        realProductId,
        currentItems: state.items,
      });

      if (!stockProductId) {
        console.error('[Cart][ADD_ITEM][BLOQUE] Produit sans ID stock utilisable. Champs attendus: stock_product_id ou id.', product);
        return state;
      }

      const existingItemIndex = state.items.findIndex(item => String(getCartItemId(item)) === String(stockProductId));
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          stock_product_id: stockProductId,
          real_product_id: realProductId ?? updatedItems[existingItemIndex].real_product_id ?? null,
          name: product.name || product.product_name || product.product?.name || updatedItems[existingItemIndex].name,
          code: product.code || product.product?.code || updatedItems[existingItemIndex].code,
          quantity: updatedItems[existingItemIndex].quantity + 1
        };

        console.log('[Cart][ADD_ITEM] Produit déjà dans le panier, quantité augmentée:', {
          stockProductId,
          realProductId,
          before: state.items[existingItemIndex],
          after: updatedItems[existingItemIndex],
          nextItems: updatedItems,
        });

        return {
          ...state,
          items: updatedItems
        };
      } else {
        const salePrice = parseFloat(product.sale_price_ttc ?? product.sale_price ?? 0) || 0;
        const salePriceHt = parseFloat(product.sale_price_ht ?? 0) || 0;
        const tva = parseFloat(product.tva ?? (salePrice - salePriceHt)) || 0;
        const newItem = {
          product_id: stockProductId,
          stock_product_id: stockProductId,
          real_product_id: realProductId,
          name: product.name || product.product_name || product.product?.name || `Produit ${stockProductId}`,
          code: product.code || product.product?.code || `PROD${stockProductId}`,
          quantity: 1,
          sale_price: salePrice,
          discount: 0,
          tva: tva,
          discount_fbu: 0, 
          unit: product.unit || product.product?.unit || 'pcs',
          available_stock: product.quantity_disponible ?? product.available_stock ?? product.quantity ?? 0,
          image: product.image || product.product?.image
        };

        console.log('[Cart][ADD_ITEM] Nouvel item ajouté au panier:', {
          stockProductId,
          realProductId,
          newItem,
          nextItems: [...state.items, newItem],
        });

        return {
          ...state,
          items: [...state.items, newItem]
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => String(getCartItemId(item)) !== String(action.payload.productId))
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      // if (quantity <= 0) {
      //   return {
      //     ...state,
      //     items: state.items.filter(item => item.product_id !== productId)
      //   };
      // }
      
      return {
        ...state,
        items: state.items.map(item =>
          String(getCartItemId(item)) === String(productId)
            ? { ...item, quantity: parseFloat(quantity) }
            : item
        )
      };
    }

    case CART_ACTIONS.UPDATE_PRICE: {
      const { productId, price } = action.payload;
      return {
        ...state,
        items: state.items.map(item =>
          String(getCartItemId(item)) === String(productId)
            ? { ...item, sale_price: parseFloat(price) }
            : item
        )
      };
    }

    case CART_ACTIONS.UPDATE_DISCOUNT: {
      const { productId, discount } = action.payload;
      
      return {
        ...state,
        items: state.items.map(item =>
          String(getCartItemId(item)) === String(productId)
            ? { ...item, discount: Math.max(0, Math.min(100, parseFloat(discount) || 0)) }
            : item
        )
      };
    }

    case CART_ACTIONS.UPDATE_DISCOUNT_FBU: {
      const { productId, discountFBU } = action.payload;
      
      return {
        ...state,
        items: state.items.map(item =>
          String(getCartItemId(item)) === String(productId)
            ? { ...item, discount_fbu: Math.max(0, parseFloat(discountFBU) || 0) }
            : item
        )
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      console.warn('[Cart][CLEAR_CART] Panier vidé:', {
        previousItems: state.items,
      });

      return {
        ...state,
        items: []
      };
    }

    case CART_ACTIONS.LOAD_CART: {
      console.warn('[Cart][LOAD_CART] Panier remplacé:', {
        previousItems: state.items,
        loadedItems: action.payload.items || [],
      });

      return {
        ...state,
        items: action.payload.items || []
      };
    }

    case CART_ACTIONS.SET_LOADING: {
      return {
        ...state,
        loading: action.payload.loading
      };
    }

    default:
      return state;
  }
};


const initialState = {
  items: [],
  loading: false
};


const CartContext = createContext();


export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  
  const calculateTotals = React.useMemo(() => {
    let subtotal = 0;
    let totalTVA = 0;
    let totalDiscount = 0;

    state.items.forEach(item => {
      // console.log("item", item);
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.sale_price) || 0;
      const discountPercent = parseFloat(item.discount) || 0; 
      const discountFBU = parseFloat(item.discount_fbu) || 0; 

      const itemSubtotal = quantity * price;
      const itemTVA = (item.tva || 0);
      totalTVA += itemTVA;
      
      
      const percentDiscountAmount = (itemSubtotal * discountPercent) / 100; 
      const fbuDiscountAmount = discountFBU * quantity; 
      const totalItemDiscount = percentDiscountAmount + fbuDiscountAmount;

      subtotal += itemSubtotal;
      totalDiscount += totalItemDiscount;
    });

    const totalAmount = subtotal - totalDiscount;

    return {
      subtotal,
      totalTVA,
      totalDiscount,
      totalAmount,
      itemsCount: state.items.length
    };
  }, [state.items]);

  
  const calculateDiscountPercentage = React.useCallback((item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.sale_price) || 0;
    const discountFBU = parseFloat(item.discount_fbu) || 0;
    
    const subtotal = quantity * price;
    if (subtotal === 0) return 0;
    
    
    const totalDiscountFBU = discountFBU * quantity;
    return (totalDiscountFBU * 100) / subtotal;
  }, []);

  const getStockErrors = React.useMemo(() => {
    return state.items.filter(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const availableStock = parseFloat(item.available_stock) || 0;
      return quantity > availableStock;
    });
  }, [state.items]);
  
  const getStockProformaErrors = React.useMemo(() => {
    console.log('[Cart][getStockProformaErrors] Analyse du panier proforma:', {
      itemsCount: state.items.length,
      items: state.items,
    });

    return state.items.filter(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const availableStock = parseFloat(item.available_stock) || 0;
      const price = parseFloat(item.sale_price) || 0;
      const hasProductId = Boolean(getCartItemId(item));

      const blockers = [];

      if (!hasProductId) {
        blockers.push('product_id manquant');
      }

      if (quantity <= 0) {
        blockers.push('quantité <= 0');
      }

      if (price <= 0) {
        blockers.push('prix <= 0');
      }

      if (quantity > availableStock) {
        blockers.push(`quantité (${quantity}) > stock disponible (${availableStock})`);
      }

      // if (blockers.length > 0) {
      //   console.warn('[Cart][getStockProformaErrors][A_VERIFIER]', {
      //     product_id: item.product_id,
      //     name: item.name,
      //     blockers,
      //     item,
      //   });

      //   return false;
      // }

      console.log('[Cart][getStockProformaErrors][OK]', {
        product_id: item.product_id,
        stock_product_id: item.stock_product_id,
        real_product_id: item.real_product_id,
        name: item.name,
        quantity,
        availableStock,
        price,
      });

      return false;
    });
  }, [state.items]);

  const addItem = React.useCallback((product) => {
    const stockProductId = getStockProductId(product);
    const realProductId = getRealProductId(product);

    if (!stockProductId) {
      console.error('[Cart][addItem][BLOQUE] Aucun ID stock détecté pour ce produit:', product);
      return false;
    }

    console.log('[Cart][addItem] Dispatch ADD_ITEM:', {
      stockProductId,
      realProductId,
      product,
    });

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product }
    });

    return true;
  }, []);

  const removeItem = React.useCallback((productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId }
    });
  }, []);

  const updateQuantity = React.useCallback((productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
  }, []);

  const updatePrice = React.useCallback((productId, price) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_PRICE,
      payload: { productId, price }
    });
  }, []);

  const updateDiscount = React.useCallback((productId, discount) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_DISCOUNT,
      payload: { productId, discount }
    });
  }, []);

  const updateDiscountFBU = React.useCallback((productId, discountFBU) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_DISCOUNT_FBU,
      payload: { productId, discountFBU }
    });
  }, []);

  const clearCart = React.useCallback(() => {
    dispatch({
      type: CART_ACTIONS.CLEAR_CART
    });
  }, []);

  const loadCart = React.useCallback((items) => {
    dispatch({
      type: CART_ACTIONS.LOAD_CART,
      payload: { items }
    });
  }, []);

  const setLoading = React.useCallback((loading) => {
    dispatch({
      type: CART_ACTIONS.SET_LOADING,
      payload: { loading }
    });
  }, []);

  // Fonctions utilitaires
  const getItemByProductId = React.useCallback((productId) => {
    return state.items.find(item => String(getCartItemId(item)) === String(productId));
  }, [state.items]);

  const isProductInCart = React.useCallback((productId) => {
    return state.items.some(item => String(getCartItemId(item)) === String(productId));
  }, [state.items]);

  const getTotalQuantity = React.useCallback(() => {
    return state.items.reduce((total, item) => total + (parseFloat(item.quantity) || 0), 0);
  }, [state.items]);

  const validateCart = React.useCallback(() => {
    const errors = [];
    
    state.items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const availableStock = parseFloat(item.available_stock) || 0;
      const price = parseFloat(item.sale_price) || 0;

      if (quantity <= 0) {
        errors.push(`La quantité du produit ${item.name} doit être supérieure à 0`);
      }

      if (quantity > availableStock) {
        errors.push(`Stock insuffisant pour ${item.name}. Stock disponible: ${availableStock}`);
      }

      if (price <= 0) {
        errors.push(`Le prix du produit ${item.name} doit être supérieur à 0`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [state.items]);

  const saveToLocalStorage = React.useCallback(() => {
    try {
      const cartData = {
        items: state.items,
        timestamp: Date.now()
      };
      localStorage.setItem('sales_cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  }, [state.items]);

  const loadFromLocalStorage = React.useCallback(() => {
    try {
      const savedCart = localStorage.getItem('sales_cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        
        const isExpired = Date.now() - cartData.timestamp > 3600000;
        
        if (!isExpired && cartData.items) {
          loadCart(cartData.items);
        } else {
          localStorage.removeItem('sales_cart');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      localStorage.removeItem('sales_cart');
    }
  }, [loadCart]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);



  const batchUpdateItems = React.useCallback((updates) => {
    updates.forEach(update => {
      switch (update.type) {
        case 'quantity':
          updateQuantity(update.productId, update.value);
          break;
        case 'price':
          updatePrice(update.productId, update.value);
          break;
        case 'discount':
          updateDiscount(update.productId, update.value);
          break;
        case 'discount_fbu':
          updateDiscountFBU(update.productId, update.value);
          break;
        default:
          break;
      }
    });
  }, [updateQuantity, updatePrice, updateDiscount]);

  const exportCart = React.useCallback(() => {
    return {
      items: state.items,
      totals: calculateTotals,
      timestamp: Date.now(),
      version: '1.0'
    };
  }, [state.items, calculateTotals]);

  const importCart = React.useCallback((cartData) => {
    if (cartData && cartData.items && Array.isArray(cartData.items)) {
      loadCart(cartData.items);
      return true;
    }
    return false;
  }, [loadCart]);

  const value = React.useMemo(() => ({
    
    items: state.items,
    loading: state.loading,
    totals: calculateTotals,
    stockErrors: getStockErrors,
    stockProformaErrors: getStockProformaErrors,
    
    addItem,
    removeItem,
    updateQuantity,
    updatePrice,
    updateDiscount,
    updateDiscountFBU, 
    clearCart,
    loadCart,
    setLoading,
    
    getItemByProductId,
    isProductInCart,
    getTotalQuantity,
    validateCart,
    calculateDiscountPercentage,
    
    batchUpdateItems,
    exportCart,
    importCart,
    
    saveToLocalStorage,
    loadFromLocalStorage
  }), [
    state.items,
    state.loading,
    calculateTotals,
    getStockErrors,
    getStockProformaErrors,
    addItem,
    removeItem,
    updateQuantity,
    updatePrice,
    updateDiscount,
    updateDiscountFBU, 
    clearCart,
    loadCart,
    setLoading,
    getItemByProductId,
    isProductInCart,
    getTotalQuantity,
    validateCart,
    calculateDiscountPercentage, 
    batchUpdateItems,
    exportCart,
    importCart,
    saveToLocalStorage,
    loadFromLocalStorage
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
