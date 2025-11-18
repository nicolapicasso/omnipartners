# Estructura de Base de Datos - Portal de Partners Omniwallet

## 📊 Diagrama de Relaciones

```
┌─────────────┐
│   Partner   │──┐
└─────────────┘  │
       │         │
       │ 1:N     │ 1:N
       │         │
┌──────▼─────┐  │
│    User    │  │
└────────────┘  │
       │        │
       │ 1:N    │ 1:N
       │        │
┌──────▼─────┐◄─┘
│    Lead    │
└────────────┘
       │
       │ 1:N
       │
┌──────▼─────────┐
│    Payment     │
└────────────────┘
       │
       │ N:M
       │
┌──────▼─────────┐
│ InvoicePayment │◄────┐
└────────────────┘     │
                       │ N:M
                ┌──────┴────────┐
                │    Invoice    │
                └───────────────┘
                       │
                       │ N:1
                       │
                ┌──────▼─────┐
                │  Partner   │
                └────────────┘
```

## 🗃️ Modelos

### 1. Partner (Partners/Organizaciones)

Representa una organización partner de Omniwallet.

**Campos:**
- `id` - Identificador único
- `email` - Email único del partner
- `password` - Contraseña hasheada
- `companyName` - Nombre de la empresa
- `contactName` - Nombre del contacto principal
- `phone` - Teléfono (opcional)
- `country` - País
- `website` - Sitio web (opcional)
- `address` - Dirección (opcional)
- `status` - Estado: PENDING, ACTIVE, REJECTED, SUSPENDED
- `partnerCategory` - Categoría: AGENCY_PARTNER, TECH_PARTNER, REFERRAL, CUSTOM
- `role` - Siempre PARTNER_OWNER
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización
- `approvedAt` - Fecha de aprobación (opcional)

**Relaciones:**
- `users[]` - Usuarios asociados al partner
- `leads[]` - Leads gestionados por el partner
- `invoices[]` - Facturas del partner
- `notifications[]` - Notificaciones del partner

---

### 2. User (Usuarios Multi-organización)

Representa usuarios que pueden ser admins o usuarios de partners.

**Campos:**
- `id` - Identificador único
- `email` - Email único
- `password` - Contraseña hasheada
- `name` - Nombre completo
- `role` - Rol: ADMIN, PARTNER_OWNER, PARTNER_USER
- `partnerId` - ID del partner (null para admins)
- `isActive` - Usuario activo o inactivo
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización
- `lastLoginAt` - Último login (opcional)

**Relaciones:**
- `partner` - Partner al que pertenece (opcional)
- `leadsCreated[]` - Leads creados por este usuario
- `notifications[]` - Notificaciones del usuario

**Roles:**
- **ADMIN**: Acceso completo al sistema
- **PARTNER_OWNER**: Dueño de la organización partner
- **PARTNER_USER**: Usuario colaborador del partner

---

### 3. Lead (Leads/Clientes Potenciales)

Representa empresas que son leads, prospects o clientes.

**Campos:**
- `id` - Identificador único
- `companyName` - Nombre de la empresa
- `contactName` - Nombre del contacto
- `email` - Email de contacto
- `phone` - Teléfono (opcional)
- `country` - País
- `website` - Sitio web (opcional)
- `status` - Estado: LEAD, PROSPECT, CLIENT
- `commissionType` - Tipo: AGENCY_PARTNER, TECH_PARTNER, REFERRAL, CUSTOM
- `commissionRate` - Porcentaje de comisión (0.0 - 100.0)
- `partnerId` - ID del partner asignado
- `createdById` - ID del usuario que lo creó
- `notes` - Notas adicionales (opcional)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización
- `assignedAt` - Fecha de asignación al partner
- `convertedAt` - Fecha de conversión a CLIENT (opcional)

**Relaciones:**
- `partner` - Partner asignado
- `createdBy` - Usuario que creó el lead
- `payments[]` - Pagos realizados por este lead

**Estados:**
- **LEAD**: Cliente potencial inicial
- **PROSPECT**: Lead calificado, en proceso de conversión
- **CLIENT**: Cliente activo que genera pagos

**Tipos de Comisión:**
La comisión se asigna **por lead individual**, no por partner. El admin define qué tipo de comisión aplica a cada lead específico.

---

### 4. Payment (Pagos de Clientes)

Representa pagos realizados por los clientes (leads convertidos).

**Campos:**
- `id` - Identificador único
- `leadId` - ID del lead que realizó el pago
- `amount` - Monto del pago
- `currency` - Moneda (default: EUR)
- `paymentDate` - Fecha del pago
- `status` - Estado: PENDING, COMPLETED, FAILED
- `commissionAmount` - Monto de comisión calculado automáticamente
- `externalReference` - Referencia externa de la intranet Omniwallet
- `description` - Descripción del pago (opcional)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

**Relaciones:**
- `lead` - Lead que realizó el pago
- `invoices[]` - Facturas que incluyen este pago

**Cálculo de Comisión:**
```
commissionAmount = amount * (lead.commissionRate / 100)
```

---

### 5. Invoice (Facturas de Comisiones)

Representa facturas generadas para pagar comisiones a partners.

**Campos:**
- `id` - Identificador único
- `partnerId` - ID del partner
- `invoiceNumber` - Número de factura único
- `periodMonth` - Mes del periodo (1-12)
- `periodYear` - Año del periodo
- `totalAmount` - Monto total de la factura
- `currency` - Moneda (default: EUR)
- `status` - Estado: DRAFT, SENT, PAID
- `pdfUrl` - URL del PDF de la factura (opcional)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización
- `sentAt` - Fecha de envío (opcional)
- `paidAt` - Fecha de pago (opcional)

**Relaciones:**
- `partner` - Partner al que se factura
- `payments[]` - Pagos incluidos en la factura

**Workflow:**
1. **DRAFT**: Factura en borrador
2. **SENT**: Factura enviada al partner
3. **PAID**: Factura pagada por Omniwallet

---

### 6. InvoicePayment (Relación Factura-Pago)

Tabla intermedia que relaciona facturas con pagos (relación muchos a muchos).

**Campos:**
- `id` - Identificador único
- `invoiceId` - ID de la factura
- `paymentId` - ID del pago
- `createdAt` - Fecha de creación

**Relaciones:**
- `invoice` - Factura
- `payment` - Pago

**Nota:** Un pago puede estar en múltiples facturas (ej: facturas parciales), y una factura puede incluir múltiples pagos.

---

### 7. Content (Contenido del Portal)

Representa contenido educativo y recursos para partners.

**Campos:**
- `id` - Identificador único
- `title` - Título del contenido
- `description` - Descripción (opcional)
- `type` - Tipo de contenido
- `category` - Categoría personalizada (opcional)
- `fileUrl` - URL del archivo (opcional)
- `videoUrl` - URL del video (opcional)
- `fileSize` - Tamaño del archivo en bytes (opcional)
- `mimeType` - Tipo MIME del archivo (opcional)
- `isPublished` - Publicado o no
- `publishedAt` - Fecha de publicación (opcional)
- `order` - Orden de visualización
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

**Tipos de Contenido:**
- **COMMERCIAL**: Material comercial, brochures, presentaciones
- **TECHNICAL**: Documentación técnica, guías de integración
- **STRATEGIC**: Estrategias de negocio, playbooks
- **DOCUMENT**: Documentos generales
- **CONTRACT**: Contratos, términos y condiciones
- **VIDEO**: Videos educativos, webinars
- **CERTIFICATION**: Certificaciones, badges

---

### 8. Notification (Notificaciones)

Representa notificaciones para usuarios y partners.

**Campos:**
- `id` - Identificador único
- `userId` - ID del usuario (opcional)
- `partnerId` - ID del partner (opcional)
- `type` - Tipo de notificación
- `title` - Título
- `message` - Mensaje
- `isRead` - Leída o no
- `readAt` - Fecha de lectura (opcional)
- `metadata` - Datos adicionales en JSON (opcional)
- `createdAt` - Fecha de creación

**Relaciones:**
- `user` - Usuario (opcional)
- `partner` - Partner (opcional)

**Tipos de Notificación:**
- `PARTNER_REGISTERED` - Nuevo partner registrado
- `PARTNER_APPROVED` - Partner aprobado
- `PARTNER_REJECTED` - Partner rechazado
- `NEW_LEAD` - Nuevo lead asignado
- `LEAD_CONVERTED` - Lead convertido a cliente
- `NEW_PAYMENT` - Nuevo pago registrado
- `INVOICE_GENERATED` - Factura generada
- `INVOICE_PAID` - Factura pagada
- `NEW_CONTENT` - Nuevo contenido publicado
- `USER_INVITED` - Usuario invitado al equipo

---

## 🔄 Flujos de Trabajo

### Flujo de Registro de Partner

1. Partner se registra → Status: `PENDING`
2. Notificación a admins: `PARTNER_REGISTERED`
3. Admin aprueba/rechaza
4. Si aprobado → Status: `ACTIVE`, `approvedAt` = now
5. Notificación a partner: `PARTNER_APPROVED`
6. Partner puede acceder al portal

### Flujo de Creación de Lead

1. Partner o Admin crea lead
2. Admin asigna tipo de comisión y tasa
3. Lead creado con status: `LEAD`
4. Notificación al partner: `NEW_LEAD`

### Flujo de Conversión de Lead

1. Lead → Prospect (status: `PROSPECT`)
2. Prospect → Cliente (status: `CLIENT`, `convertedAt` = now)
3. Notificación al partner: `LEAD_CONVERTED`

### Flujo de Pagos y Comisiones

1. Cliente realiza pago (desde intranet Omniwallet)
2. Pago registrado en sistema
3. Comisión calculada automáticamente
4. Notificación al partner: `NEW_PAYMENT`
5. Admin genera factura mensual
6. Factura incluye todos los pagos del periodo
7. Factura enviada → Status: `SENT`
8. Partner genera su factura
9. Omniwallet paga → Status: `PAID`

---

## 📈 Índices y Performance

### Índices Recomendados

```sql
-- Partners
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_status ON partners(status);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_partner_id ON users(partnerId);
CREATE INDEX idx_users_role ON users(role);

-- Leads
CREATE INDEX idx_leads_partner_id ON leads(partnerId);
CREATE INDEX idx_leads_created_by_id ON leads(createdById);
CREATE INDEX idx_leads_status ON leads(status);

-- Payments
CREATE INDEX idx_payments_lead_id ON payments(leadId);
CREATE INDEX idx_payments_payment_date ON payments(paymentDate);
CREATE INDEX idx_payments_status ON payments(status);

-- Invoices
CREATE INDEX idx_invoices_partner_id ON invoices(partnerId);
CREATE INDEX idx_invoices_period ON invoices(periodMonth, periodYear);
CREATE INDEX idx_invoices_status ON invoices(status);
```

---

## 🔒 Seguridad

### Control de Acceso

- **Admins**: Acceso completo a todos los datos
- **Partner Owners**: Solo datos de su organización
- **Partner Users**: Solo datos de su organización (lectura limitada)

### Validaciones

- Passwords hasheados con bcrypt
- Emails únicos
- Validación de rangos de comisión (0-100%)
- Soft deletes con `onDelete: Cascade`

---

## 🚀 Próximos Pasos

Con esta estructura de base de datos lista, podemos proceder a:

1. ✅ Crear migraciones de Prisma
2. ⬜ Implementar sistema de autenticación
3. ⬜ Crear APIs y Server Actions
4. ⬜ Construir interfaces de usuario
5. ⬜ Implementar integraciones (Hubspot, Intranet)
