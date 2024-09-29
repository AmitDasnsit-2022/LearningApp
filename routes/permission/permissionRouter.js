import express from 'express';
import * as validate from '../../helpers/validates.js';
import * as permission from '../../controllers/permission/permissionController.js';
import * as auths from '../../middlewares/auth.js';
const router = express();

router.post('/add', auths.admin('create'), validate.permissionValidate, permission.addPermission);
router.post('/getall', auths.admin('read'), permission.getAllPermissions);
router.post('/update', auths.admin('edit'), validate.permissionId, permission.updatePermission);
router.post('/delete', auths.admin('delete'), validate.permissionId, permission.deletePermission);

export default router;