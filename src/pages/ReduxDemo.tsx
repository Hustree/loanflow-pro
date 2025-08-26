import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import Grid from '@mui/system/Grid'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  addLoan,
  updateLoanStatus,
  removeLoan,
} from '../store/loanSlice'
import {
  addMember,
  updateMember,
  deleteMember,
  addLoanToMember,
} from '../store/memberSlice'
import {
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from '../store/loanProductSlice'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ReduxDemo() {
  const dispatch = useAppDispatch()
  const loans = useAppSelector((state) => state.loan.loans)
  const members = useAppSelector((state) => state.member.members)
  const products = useAppSelector((state) => state.loanProduct.products)
  
  const [tabValue, setTabValue] = useState(0)
  const [editDialog, setEditDialog] = useState(false)
  const [editingLoan, setEditingLoan] = useState<any>(null)
  
  // Loan Form State
  const [loanForm, setLoanForm] = useState({
    name: '',
    pnpBfpId: '',
    amount: 0,
    type: 'Emergency' as any,
    term: 12 as any,
    monthlyIncome: 0,
    disbursementMode: 'PNB' as any,
  })
  
  // Member Form State
  const [memberForm, setMemberForm] = useState({
    memberNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as any,
  })
  
  // Product Form State
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    description: '',
    minAmount: 0,
    maxAmount: 0,
    interestRate: 0,
    processingFee: 0,
    availableTerms: [] as number[],
    requirements: [] as string[],
    isActive: true,
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // LOAN CRUD OPERATIONS
  const handleAddLoan = () => {
    if (loanForm.name && loanForm.amount > 0) {
      dispatch(addLoan(loanForm))
      setLoanForm({
        name: '',
        pnpBfpId: '',
        amount: 0,
        type: 'Emergency',
        term: 12,
        monthlyIncome: 0,
        disbursementMode: 'PNB',
      })
    }
  }

  const handleUpdateLoanStatus = (id: string, status: any) => {
    const notes = prompt('Add notes for this status update:')
    if (notes) {
      dispatch(updateLoanStatus({ id, status, notes }))
    }
  }

  const handleDeleteLoan = (id: string) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      dispatch(removeLoan(id))
    }
  }

  // MEMBER CRUD OPERATIONS
  const handleAddMember = () => {
    if (memberForm.firstName && memberForm.lastName) {
      dispatch(addMember({
        ...memberForm,
        dateJoined: new Date(),
      }))
      setMemberForm({
        memberNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
      })
    }
  }

  const handleUpdateMember = (id: string, updates: any) => {
    dispatch(updateMember({ id, ...updates }))
  }

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      dispatch(deleteMember(id))
    }
  }

  // PRODUCT CRUD OPERATIONS
  const handleAddProduct = () => {
    if (productForm.code && productForm.name) {
      dispatch(addProduct(productForm))
      setProductForm({
        code: '',
        name: '',
        description: '',
        minAmount: 0,
        maxAmount: 0,
        interestRate: 0,
        processingFee: 0,
        availableTerms: [],
        requirements: [],
        isActive: true,
      })
    }
  }

  const handleToggleProduct = (id: string) => {
    dispatch(toggleProductStatus(id))
  }

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      case 'disbursed': return 'info'
      case 'completed': return 'default'
      default: return 'default'
    }
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" gutterBottom>
          Redux Demo - Loan Management System
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Redux DevTools:</strong> Open your browser's Redux DevTools extension to see:
            • Real-time state changes
            • Action dispatches
            • Time-travel debugging
            • State tree inspection
          </Typography>
        </Alert>

        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Redux Pattern Advantages:
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="primary">
                    Predictable State
                  </Typography>
                  <Typography variant="body2">
                    Single source of truth with immutable updates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="primary">
                    Centralized Logic
                  </Typography>
                  <Typography variant="body2">
                    All state mutations in reducers/slices
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="primary">
                    Time Travel Debug
                  </Typography>
                  <Typography variant="body2">
                    Undo/redo actions with DevTools
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="primary">
                    Component Decoupling
                  </Typography>
                  <Typography variant="body2">
                    Any component can access state
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<MoneyIcon />} label="Loans CRUD" />
            <Tab icon={<PersonIcon />} label="Members CRUD" />
            <Tab icon={<CategoryIcon />} label="Products CRUD" />
          </Tabs>
        </Box>

        {/* LOANS TAB */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Create New Loan
                </Typography>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Borrower Name"
                    value={loanForm.name}
                    onChange={(e) => setLoanForm({ ...loanForm, name: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="PNP/BFP ID"
                    value={loanForm.pnpBfpId}
                    onChange={(e) => setLoanForm({ ...loanForm, pnpBfpId: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Loan Amount"
                    type="number"
                    value={loanForm.amount}
                    onChange={(e) => setLoanForm({ ...loanForm, amount: Number(e.target.value) })}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Loan Type</InputLabel>
                    <Select
                      value={loanForm.type}
                      onChange={(e) => setLoanForm({ ...loanForm, type: e.target.value as any })}
                      label="Loan Type"
                    >
                      <MenuItem value="Emergency">Emergency</MenuItem>
                      <MenuItem value="Salary">Salary</MenuItem>
                      <MenuItem value="Others">Others</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Terms (months)</InputLabel>
                    <Select
                      value={loanForm.term}
                      onChange={(e) => setLoanForm({ ...loanForm, term: e.target.value as any })}
                      label="Terms (months)"
                    >
                      <MenuItem value={12}>12 months</MenuItem>
                      <MenuItem value={24}>24 months</MenuItem>
                      <MenuItem value={36}>36 months</MenuItem>
                      <MenuItem value={48}>48 months</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Monthly Income"
                    type="number"
                    value={loanForm.monthlyIncome}
                    onChange={(e) => setLoanForm({ ...loanForm, monthlyIncome: Number(e.target.value) })}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Disbursement Mode</InputLabel>
                    <Select
                      value={loanForm.disbursementMode}
                      onChange={(e) => setLoanForm({ ...loanForm, disbursementMode: e.target.value as any })}
                      label="Disbursement Mode"
                    >
                      <MenuItem value="PNB">PNB</MenuItem>
                      <MenuItem value="UnionBank">UnionBank</MenuItem>
                      <MenuItem value="Cebuana">Cebuana</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddLoan}
                    fullWidth
                  >
                    Add Loan
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Loan Applications ({loans.length})
                </Typography>
                <List>
                  {loans.map((loan) => (
                    <React.Fragment key={loan.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">{loan.name}</Typography>
                              <Chip 
                                label={loan.status} 
                                color={getStatusColor(loan.status) as any}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                Amount: ₱{loan.amount.toLocaleString()} | 
                                Type: {loan.type} | 
                                Term: {loan.term} months
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Ref: {loan.ref} | ID: {loan.id?.substring(0, 8)}...
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleUpdateLoanStatus(loan.id!, 'approved')}
                            color="success"
                            title="Approve"
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleUpdateLoanStatus(loan.id!, 'rejected')}
                            color="error"
                            title="Reject"
                          >
                            <CancelIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteLoan(loan.id!)}
                            title="Delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  {loans.length === 0 && (
                    <ListItem>
                      <ListItemText 
                        primary="No loans yet" 
                        secondary="Add a loan using the form on the left"
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* MEMBERS TAB */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Add New Member
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Member Number"
                    value={memberForm.memberNumber}
                    onChange={(e) => setMemberForm({ ...memberForm, memberNumber: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="First Name"
                    value={memberForm.firstName}
                    onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    value={memberForm.lastName}
                    onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Phone"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Address"
                    value={memberForm.address}
                    onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddMember}
                    fullWidth
                  >
                    Add Member
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Members ({members.length})
                </Typography>
                <List>
                  {members.map((member) => (
                    <React.Fragment key={member.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${member.firstName} ${member.lastName}`}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                Member #: {member.memberNumber} | Email: {member.email}
                              </Typography>
                              <Chip 
                                label={member.status} 
                                color={member.status === 'active' ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => {
                              const newStatus = member.status === 'active' ? 'inactive' : 'active'
                              handleUpdateMember(member.id, { status: newStatus })
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  {members.length === 0 && (
                    <ListItem>
                      <ListItemText 
                        primary="No members yet" 
                        secondary="Add a member using the form on the left"
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* PRODUCTS TAB */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Add New Product
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Product Code"
                    value={productForm.code}
                    onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Product Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <TextField
                    label="Min Amount"
                    type="number"
                    value={productForm.minAmount}
                    onChange={(e) => setProductForm({ ...productForm, minAmount: Number(e.target.value) })}
                    fullWidth
                  />
                  <TextField
                    label="Max Amount"
                    type="number"
                    value={productForm.maxAmount}
                    onChange={(e) => setProductForm({ ...productForm, maxAmount: Number(e.target.value) })}
                    fullWidth
                  />
                  <TextField
                    label="Interest Rate (%)"
                    type="number"
                    value={productForm.interestRate}
                    onChange={(e) => setProductForm({ ...productForm, interestRate: Number(e.target.value) })}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddProduct}
                    fullWidth
                  >
                    Add Product
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Loan Products ({products.length})
                </Typography>
                <Grid container spacing={2}>
                  {products.map((product) => (
                    <Grid size={12} key={product.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box>
                              <Typography variant="h6">
                                {product.name} ({product.code})
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {product.description}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Amount: ₱{product.minAmount.toLocaleString()} - ₱{product.maxAmount.toLocaleString()}
                              </Typography>
                              <Typography variant="body2">
                                Interest Rate: {product.interestRate}% | Processing Fee: ₱{product.processingFee}
                              </Typography>
                              <Typography variant="body2">
                                Terms: {product.availableTerms.join(', ')} months
                              </Typography>
                            </Box>
                            <Chip 
                              label={product.isActive ? 'Active' : 'Inactive'} 
                              color={product.isActive ? 'success' : 'default'}
                            />
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            onClick={() => handleToggleProduct(product.id)}
                          >
                            {product.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  )
}