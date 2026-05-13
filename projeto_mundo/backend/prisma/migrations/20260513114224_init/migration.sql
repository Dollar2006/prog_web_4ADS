-- CreateTable
CREATE TABLE "continente" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "continente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pais" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "populacao" BIGINT NOT NULL,
    "idioma_oficial" VARCHAR(100) NOT NULL,
    "moeda" VARCHAR(50) NOT NULL,
    "id_continente" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cidade" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "populacao" BIGINT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "id_pais" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "continente_nome_key" ON "continente"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "pais_nome_key" ON "pais"("nome");

-- CreateIndex
CREATE INDEX "pais_id_continente_idx" ON "pais"("id_continente");

-- CreateIndex
CREATE INDEX "cidade_id_pais_idx" ON "cidade"("id_pais");

-- CreateIndex
CREATE INDEX "cidade_latitude_longitude_idx" ON "cidade"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "pais" ADD CONSTRAINT "pais_id_continente_fkey" FOREIGN KEY ("id_continente") REFERENCES "continente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cidade" ADD CONSTRAINT "cidade_id_pais_fkey" FOREIGN KEY ("id_pais") REFERENCES "pais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
