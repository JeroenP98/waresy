import authRoutes from './authRoutes.js';
import assetRoutes from './assetRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import assetTypeRoutes from './assetTypeRoutes.js';
import maintenanceTaskRoutes from './maintenanceTaskRoutes.js';

export default function routes(app) {
    app.use(authRoutes);
    app.use(assetRoutes);
    app.use(supplierRoutes);
    app.use(assetTypeRoutes);
    app.use(maintenanceTaskRoutes);
}
