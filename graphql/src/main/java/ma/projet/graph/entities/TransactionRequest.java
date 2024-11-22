package ma.projet.graph.entities;



import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.Date;


public class TransactionRequest {
    @NotNull
    private Date date;

    @NotNull
    private Long compteId;

    @NotNull
    private TypeTransaction type;

    @Min(0)
    private double montant;


    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Long getCompteId() {
        return compteId;
    }

    public void setCompteId(Long compteId) {
        this.compteId = compteId;
    }

    public TypeTransaction getType() {
        return type;
    }

    public void setType(TypeTransaction type) {
        this.type = type;
    }

    public double getMontant() {
        return montant;
    }

    public void setMontant(double montant) {
        this.montant = montant;
    }
}
