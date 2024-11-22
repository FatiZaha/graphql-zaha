import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
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
import { TypeCompte } from "../enums/TypeCompte";

// GraphQL Queries and Mutations
const GET_COMPTES = gql`
  query {
    allComptes {
      id
      solde
      dateCreation
      type
    }
  }
`;

const SAVE_COMPTE = gql`
  mutation SaveCompte($input: CompteRequest!) {
    saveCompte(compte: $input) {
      id
      solde
      dateCreation
      type
    }
  }
`;

const DELETE_COMPTE = gql`
  mutation DeleteCompte($id: ID!) {
    deleteCompte(id: $id)
  }
`;

export default function CompteList() {
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}/${month}/${day}`;
  };

  const { loading, error, data, refetch } = useQuery(GET_COMPTES);
  const [saveCompte] = useMutation(SAVE_COMPTE);
  const [deleteCompte] = useMutation(DELETE_COMPTE);

  const [showDetails, setShowDetails] = useState({}); // Toggle details visibility
  const [openDialog, setOpenDialog] = useState(false); // Manage dialog visibility
  const [newCompte, setNewCompte] = useState({
    solde: "",
    dateCreation: "",
    type: TypeCompte.COURANT, // Default type
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
    setNewCompte((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Save Compte
  const handleSaveCompte = async () => {
    try {
      await saveCompte({
        variables: {
          input: {
            solde: parseFloat(newCompte.solde),
            dateCreation: formatDate(new Date()).toString(),
            type: newCompte.type,
          },
        },
      });
      refetch(); // Refetch comptes
      handleDialogClose(); // Close dialog
      setNewCompte({ solde: "", dateCreation: "", type: TypeCompte.COURANT }); // Reset form
    } catch (err) {
      console.error("Error saving compte:", err);
    }
  };

  // Handle Delete Compte
  const handleDeleteCompte = async (id) => {
    try {
      const numericId = Number(id); // Ensure id is parsed to a number
      await deleteCompte({ variables: { id: numericId } }); // Call mutation with numeric ID
      refetch(); // Refetch comptes to update the list
    } catch (err) {
      console.error("Error deleting compte:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "20px auto" }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 3 }}>
        Compte List
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleDialogOpen}
        sx={{ marginBottom: 3 }}
      >
        Add New Compte
      </Button>
      <List>
        {data.allComptes.map(({ id, solde, dateCreation, type }) => (
          <ListItem key={id} sx={{ marginBottom: 2, padding: 0 }}>
            <Card sx={{ width: "100%" }}>
              <CardContent>
                <Typography variant="h6">
                  Type: {type} | Solde: {solde}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => toggleDetails(id)}
                  sx={{ marginTop: 2, marginRight: 2 }}
                >
                  {showDetails[id] ? "Hide Details" : "Show More"}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDeleteCompte(id)}
                  sx={{ marginTop: 2 }}
                >
                  Delete
                </Button>
                {showDetails[id] && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography>
                      <strong>Date Creation:</strong> {dateCreation}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>

      {/* Add Compte Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New Compte</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fill in the details to add a new compte.
          </DialogContentText>
          <TextField
            margin="dense"
            name="solde"
            label="Solde"
            type="number"
            fullWidth
            variant="outlined"
            value={newCompte.solde}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={newCompte.type}
              onChange={handleInputChange}
            >
              <MenuItem value={TypeCompte.COURANT}>COURANT</MenuItem>
              <MenuItem value={TypeCompte.EPARGNE}>EPARGNE</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveCompte} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
