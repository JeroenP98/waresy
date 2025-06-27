import authRoutes from './authRoutes.js';
import assetRoutes from './assetRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import assetTypeRoutes from './assetTypeRoutes.js';
import maintenanceTaskRoutes from './maintenanceTaskRoutes.js';

export default function routes(app) {
    app.use('/api', authRoutes);
    app.use('/api',assetRoutes);
    app.use('/api',supplierRoutes);
    app.use('/api',assetTypeRoutes);
    app.use('/api',maintenanceTaskRoutes);
}
