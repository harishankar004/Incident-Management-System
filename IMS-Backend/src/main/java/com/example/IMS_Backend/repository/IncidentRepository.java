package com.example.IMS_Backend.repository;

import com.example.IMS_Backend.incident.Incident;
import com.example.IMS_Backend.incident.IncidentPriority;
import com.example.IMS_Backend.incident.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    Page<Incident> findByCreatedById(Long userId, Pageable p);
    Page<Incident> findByOwnerId(Long ownerId, Pageable p);
    Page<Incident> findByStatus(IncidentStatus status, Pageable p);

    @Query("SELECT i FROM Incident i WHERE " +
           "(:status   IS NULL OR i.status     = :status)   AND " +
           "(:priority IS NULL OR i.priority   = :priority) AND " +
           "(:catId    IS NULL OR i.category.id = :catId)   AND " +
           "(:ownerId  IS NULL OR i.owner.id   = :ownerId)  AND " +
           "(:search   IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Incident> search(@Param("status")   IncidentStatus   status,
                          @Param("priority") IncidentPriority priority,
                          @Param("catId")    Long             catId,
                          @Param("ownerId")  Long             ownerId,
                          @Param("search")   String           search,
                          Pageable p);

    long countByStatus(IncidentStatus status);
    long countBySlaBreach(Boolean slaBreach);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.createdBy.id = :uid")
    long countByCreatedById(@Param("uid") Long uid);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.owner.id = :uid " +
           "AND i.status NOT IN ('RESOLVED','CLOSED')")
    long countOpenByOwnerId(@Param("uid") Long uid);
}
