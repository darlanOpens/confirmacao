-- CreateTable
CREATE TABLE "preselection" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preselection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preselection_email_key" ON "preselection"("email");
