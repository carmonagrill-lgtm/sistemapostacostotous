/* -- Firebase Configuration -- */

const firebaseConfig = {
  apiKey: "AIzaSyC5q5w5w5w5w5w5w5w5w5w5w5w5w5w5w5w5w",
  authDomain: "sistema-pos-tacos-totous.firebaseapp.com",
  projectId: "sistema-pos-tacos-totous",
  storageBucket: "sistema-pos-tacos-totous.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── Data Loading ──
async function loadDataFromFirebase() {
  try {
    console.log('🔄 Cargando datos desde Firebase...');

    // Load products
    const productsSnap = await db.collection('products').get();
    if (!productsSnap.empty) {
      products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('✅ Productos cargados:', products.length);
    }

    // Load ingredients
    const ingredientsSnap = await db.collection('ingredients').get();
    if (!ingredientsSnap.empty) {
      ingredientes = ingredientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('✅ Ingredientes cargados:', ingredientes.length);
    }

    // Load recipes
    const recipesSnap = await db.collection('recipes').get();
    if (!recipesSnap.empty) {
      recetas = recipesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('✅ Recetas cargadas:', recetas.length);
    }

    // Load transactions
    const transactionsSnap = await db.collection('transactions').get();
    if (!transactionsSnap.empty) {
      txns = transactionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('✅ Transacciones cargadas:', txns.length);
    }

    console.log('🎉 Todos los datos cargados correctamente');
  } catch (error) {
    console.error('❌ Error cargando datos:', error);
  }
}

// ── Data Saving ──
async function saveDataToFirebase(collectionName, data) {
  try {
    await db.collection(collectionName).doc(data.id.toString()).set(data);
    console.log(`💾 ${collectionName} guardado:`, data.id);
  } catch (error) {
    console.error(`❌ Error guardando ${collectionName}:`, error);
  }
}

async function saveProducts() {
  for (const product of products) {
    await saveDataToFirebase('products', product);
  }
}

async function saveIngredients() {
  for (const ingredient of ingredientes) {
    await saveDataToFirebase('ingredients', ingredient);
  }
}

async function saveRecipes() {
  for (const recipe of recetas) {
    await saveDataToFirebase('recipes', recipe);
  }
}

async function saveTransactions() {
  for (const txn of txns) {
    await saveDataToFirebase('transactions', txn);
  }
}

// ── Initialization ──
async function uploadInitialData() {
  try {
    // Check if data already exists
    const productsSnap = await db.collection('products').limit(1).get();
    if (productsSnap.empty) {
      console.log('📤 Subiendo datos iniciales...');
      await saveProducts();
      await saveIngredients();
      await saveRecipes();
      console.log('✅ Datos iniciales subidos');
    } else {
      console.log('ℹ️ Datos ya existen en Firebase');
    }
  } catch (error) {
    console.error('❌ Error subiendo datos iniciales:', error);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadDataFromFirebase();
  await uploadInitialData();
});</content>
<parameter name="filePath">c:\Users\Nicol\OneDrive\Documentos\SISTEMA POS TACOS TOTOUS\firebase.js