import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {TypeTransaction} from "../enums/TransactionType";

import {
  List,
  ListItem,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

// GraphQL Queries and Mutations
const GET_TRANSACTIONS = gql`
  query {
    allTransactions {
      id
      date
      montant
      type
      compte {
        id
      }
    }
  }
`;

const ADD_TRANSACTION = gql`
  mutation AddTransaction($input: TransactionRequest!) {
    addTransaction(transaction: $input) {
      id
      date
      montant
      type
      compte {
        id
      }
    }
  }
`;

export default function TransactionList() {
    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const day = String(d.getDate()).padStart(2, "0");
      
        return `${year}/${month}/${day}`;
      };
      
  const { loading, error, data, refetch } = useQuery(GET_TRANSACTIONS);
  const [addTransaction] = useMutation(ADD_TRANSACTION);

  const [showDetails, setShowDetails] = useState({}); // Toggle details visibility
  const [openDialog, setOpenDialog] = useState(false); // Manage dialog visibility
  const [newTransaction, setNewTransaction] = useState({
    type: "DEPOT", // Default to DEPOT
    montant: "",
    date: "",
    compteId: "",
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  // Handle Show More/Hide Details Toggle
  const toggleDetails = (id) => {
    setShowDetails((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Handle Dialog Open/Close
  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Add Transaction
  const handleAddTransaction = async () => {
    try {
      await addTransaction({
        variables: {
          input: {
            type: newTransaction.type,
            montant: parseFloat(newTransaction.montant),
            date: formatDate(new Date()).toString(),
            compteId: newTransaction.compteId,
          },
        },
      });
      refetch(); // Refetch transactions
      handleDialogClose(); // Close dialog
      setNewTransaction({ type: TypeTransaction.DEPOT, montant: "", date: "", compteId: "" }); // Reset form
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "20px auto" }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 3 }}>
        Transaction List
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleDialogOpen}
        sx={{ marginBottom: 3 }}
      >
        Add New Transaction
      </Button>
      <List>
        {data.allTransactions.map(({ id, type, montant, date, compte }) => (
          <ListItem key={id} sx={{ marginBottom: 2, padding: 0 }}>
            <Card sx={{ width: "100%" }}>
              <CardContent>
                <Typography variant="h6">
                  Type: {type} | Montant: {montant}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => toggleDetails(id)}
                  sx={{ marginTop: 2 }}
                >
                  {showDetails[id] ? "Hide Details" : "Show More"}
                </Button>
                {showDetails[id] && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography>
                      <strong>Date:</strong> {date}
                    </Typography>
                    <Typography>
                      <strong>Compte ID:</strong> {compte.id}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>

      {/* Add Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fill in the details to add a new transaction.
          </DialogContentText>
          {/* Type Selector */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Transaction Type</InputLabel>
            <Select
              name="type"
              value={newTransaction.type}
              onChange={handleInputChange}
            >
              <MenuItem value={TypeTransaction.DEPOT}>DEPOT</MenuItem>
              <MenuItem value={TypeTransaction.RETRAIT}>RETRAIT</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="montant"
            label="Montant"
            type="number"
            fullWidth
            variant="outlined"
            value={newTransaction.montant}
            onChange={handleInputChange}
          />
          
          <TextField
            margin="dense"
            name="compteId"
            label="Compte ID"
            type="text"
            fullWidth
            variant="outlined"
            value={newTransaction.compteId}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddTransaction} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
