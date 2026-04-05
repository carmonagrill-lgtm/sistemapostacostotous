// Firebase configuration and data management

// Configuración del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCRJ3YV5gEbDeiKXMctjcc0koRyctQub5w",
  authDomain: "sistema-pos-tacos-totous.firebaseapp.com",
  projectId: "sistema-pos-tacos-totous",
  storageBucket: "sistema-pos-tacos-totous.firebasestorage.app",
  messagingSenderId: "510864516004",
  appId: "1:510864516004:web:1eacc8d928250736d25731"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Función para inicializar datos desde Firebase
async function loadDataFromFirebase() {
  try {
    // Cargar productos
    const productsSnapshot = await db.collection('products').get();
    if (!productsSnapshot.empty) {
      products = productsSnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));
    }

    // Cargar ingredientes
    const ingredientsSnapshot = await db.collection('ingredients').get();
    if (!ingredientsSnapshot.empty) {
      ingredientes = ingredientsSnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));
    }

    // Cargar recetas
    const recipesSnapshot = await db.collection('recipes').get();
    if (!recipesSnapshot.empty) {
      recetas = recipesSnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));
    }

    // Cargar transacciones
    const txnsSnapshot = await db.collection('transactions').get();
    if (!txnsSnapshot.empty) {
      txns = txnsSnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));
    }

    // Cargar compras
    const comprasSnapshot = await db.collection('compras').get();
    if (!comprasSnapshot.empty) {
      compras = comprasSnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));
    }

    // Cargar personal
    const staffSnapshot = await db.collection('staff').get();
    if (!staffSnapshot.empty) {
      staff = staffSnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));
    }

    console.log('Datos cargados desde Firebase');
  } catch (error) {
    console.error('Error cargando datos:', error);
    alert('Error conectando a Firebase. Usando datos locales.');
  } finally {
    // Renderizar vistas después de intentar cargar
    renderCats();
    renderProds();
    renderInvFull();
  }
}

// Función para guardar datos en Firebase
async function saveDataToFirebase(collectionName, data) {
  try {
    const batch = db.batch();
    for (const item of data) {
      const itemData = { ...item };
      delete itemData.id; // Firestore usa el ID como documento
      const docRef = db.collection(collectionName).doc(item.id.toString());
      batch.set(docRef, itemData);
    }
    await batch.commit();
    console.log(`Datos guardados en ${collectionName}`);
  } catch (error) {
    console.error(`Error guardando en ${collectionName}:`, error);
  }
}

// Funciones específicas para guardar cada colección
async function saveProducts() { await saveDataToFirebase('products', products); }
async function saveIngredients() { await saveDataToFirebase('ingredients', ingredientes); }
async function saveRecipes() { await saveDataToFirebase('recipes', recetas); }
async function saveTransactions() { await saveDataToFirebase('transactions', txns); }
async function saveCompras() { await saveDataToFirebase('compras', compras); }
async function saveStaff() { await saveDataToFirebase('staff', staff); }

// Función para subir datos iniciales a Firebase si está vacío
async function uploadInitialData() {
  const productsSnapshot = await db.collection('products').get();
  if (productsSnapshot.empty) {
    console.log('Subiendo datos iniciales a Firebase...');
    await saveProducts();
    await saveIngredients();
    await saveRecipes();
    await saveStaff();
    alert('Datos iniciales subidos a Firebase. Recarga la página.');
  }
}

// Llamar a loadDataFromFirebase al iniciar
loadDataFromFirebase();

// Después de un tiempo, intentar subir iniciales si vacío
setTimeout(uploadInitialData, 2000);