package ma.projet.graph.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.projet.graph.entities.*;
import ma.projet.graph.repositories.CompteRepository;
import ma.projet.graph.repositories.TransactionRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
@AllArgsConstructor

public class CompteControllerGraphQL {

    private CompteRepository compteRepository;
    private TransactionRepository transactionRepository;

    @QueryMapping
    public List<Compte> allComptes(){
        return compteRepository.findAll();
    }

    @QueryMapping
    public Compte compteById(@Argument Long id){
        Compte compte =  compteRepository.findById(id).orElse(null);
        if(compte == null) throw new RuntimeException(String.format("Compte %s not found", id));
        else return compte;
    }

    @QueryMapping
    public List<Compte> compteByType(@Argument TypeCompte type){
        List<Compte> compte =  compteRepository.findByType(type).orElse(null);
        if(compte == null) throw new RuntimeException(String.format("Compte %s not found", type));
        else return compte;
    }

    @MutationMapping
    public Compte saveCompte(@Argument Compte compte){
       return compteRepository.save(compte);
    }

    @MutationMapping
    public Boolean deleteCompte(@Argument Long id) {
        try {
            compteRepository.deleteById(id);
            return true;
        } catch (EmptyResultDataAccessException e) {
            return false;
        }
    }

    @QueryMapping
    public Map<String, Object> totalSolde() {
        long count = compteRepository.count(); // Nombre total de comptes
        double sum = compteRepository.sumSoldes(); // Somme totale des soldes
        double average = count > 0 ? sum / count : 0; // Moyenne des soldes

        return Map.of(
                "count", count,
                "sum", sum,
                "average", average
        );
    }

    @MutationMapping
    public Transaction addTransaction(@Argument("transaction") TransactionRequest transactionRequest) {
        if (transactionRequest == null) {
            throw new RuntimeException("TransactionRequest is null");
        }
        // Retrieve the Compte by ID or throw an exception if not found
        Compte compte = compteRepository.findById(transactionRequest.getCompteId())
                .orElseThrow(() -> new RuntimeException("Compte not found"));

        // Create a new Transaction
        Transaction transaction = new Transaction();
        transaction.setMontant(transactionRequest.getMontant());
        transaction.setDate(transactionRequest.getDate());
        transaction.setType(transactionRequest.getType());

        // Handle balance updates based on transaction type
        if (transaction.getType() == TypeTransaction.DEPOT) {
            compte.setSolde(compte.getSolde() + transaction.getMontant());
        } else if (transaction.getType() == TypeTransaction.RETRAIT) {
            if (compte.getSolde() < transaction.getMontant()) {
                throw new RuntimeException("Insufficient balance for this transaction");
            }
            compte.setSolde(compte.getSolde() - transaction.getMontant());
        } else {
            throw new RuntimeException("Invalid transaction type");
        }

        // Associate the transaction with the Compte
        transaction.setCompte(compte);

        // Persist the updated Compte and the Transaction
        compteRepository.save(compte); // Save the updated balance
        return transactionRepository.save(transaction);
    }


    @QueryMapping
    public List<Transaction> compteTransactions(@Argument Long id){
        Compte compte = compteRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Compte not found"));
        return transactionRepository.findByCompte(compte);
    }

    @QueryMapping
    public Map<String, Object> transactionStats(){
        long count = transactionRepository.count();
        double sumRetraits = transactionRepository.sumByType(TypeTransaction.RETRAIT);
        double sumDepots = transactionRepository.sumByType(TypeTransaction.DEPOT);
        return Map.of(
                "count",count,
                "sumDepots",sumDepots,
                "sumRetraits",sumRetraits
        );
    }
}
