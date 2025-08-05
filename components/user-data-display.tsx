interface UserData {
  CPF: string
  NOME: string
  NASC: string
  NOME_MAE: string
  SEXO: string
  RG?: string
}

interface UserDataDisplayProps {
  userData: UserData
}

export function UserDataDisplay({ userData }: UserDataDisplayProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <h3 className="font-semibold text-sm mb-3 text-gray-700">Dados Confirmados:</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Nome:</span> {userData.NOME}
        </div>
        <div>
          <span className="font-medium">CPF:</span> {userData.CPF}
        </div>
        <div>
          <span className="font-medium">Data de Nascimento:</span> {userData.NASC}
        </div>
        <div>
          <span className="font-medium">Nome da Mãe:</span> {userData.NOME_MAE}
        </div>
        <div>
          <span className="font-medium">Sexo:</span> {userData.SEXO}
        </div>
        {userData.RG && (
          <div>
            <span className="font-medium">RG:</span> {userData.RG}
          </div>
        )}
      </div>
    </div>
  )
}
