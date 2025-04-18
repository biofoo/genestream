// src/pages/SearchPage/components/SequenceGrid.tsx
import React from "react";
import { SequenceCard } from "./SequenceCard";
import { SearchResult } from "@/types";

interface SequenceGridProps {
  sequences: SearchResult[];
}

export const SequenceGrid: React.FC<SequenceGridProps> = ({ sequences }) => {
  // Debug log for incoming data
  console.log("Incoming sequences data:", sequences[0]);

  const formatSequenceForCard = (sequence: SearchResult) => {
    return {
      gs_id: sequence.gs_id,
      sequence: sequence.annotations?.sequence || "",
      score: sequence.score,
      sequence_length: sequence.sequence_length || 0,
      created_by: sequence.created_by || "Unknown",
      created_at: sequence.created_at || null,
      updated_at: sequence.updated_at || null,
      published_by: sequence.published_by || null,
      published_at: sequence.published_at || null,
      access_level: sequence.metadata.access_level,
      char_set: sequence.char_set,
      metadata: {
        organism: sequence.metadata.organism,
        public_ids: sequence.metadata.public_ids || {},
        public_names: sequence.metadata.public_names || {},
        public_aliases: sequence.metadata.public_aliases || [],
      },
      annotations: {
        name: sequence.annotations?.name || "",
        description: sequence.annotations?.description || "",
      },
      display_name: sequence.metadata.display_name || sequence.gs_id,
      display_description:
        sequence.metadata.display_description || "No description available",
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 -mt-6">
      {sequences.map((sequence) => {
        const cardProps = formatSequenceForCard(sequence);
        return <SequenceCard key={cardProps.gs_id} {...cardProps} />;
      })}
    </div>
  );
};

export default SequenceGrid;
