import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cpf = searchParams.get("cpf")

  if (!cpf) {
    return NextResponse.json({ success: false, error: "CPF is required" }, { status: 400 })
  }

  // Validate CPF format
  if (!/^\d{11}$/.test(cpf)) {
    return NextResponse.json({ success: false, error: "Invalid CPF format" }, { status: 400 })
  }

  try {
    const apiUrl = `https://magmadatahub.com/api.php?token=d7c5436286e44288a459ca98de0e140bd32fe9717dcadb1c6bd13526f24a78b9&cpf=${cpf}`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Check if the API returned valid data with the new format
    if (data && data.cpf && data.nome) {
      return NextResponse.json({
        success: true,
        userData: {
          CPF: data.cpf,
          NOME: data.nome,
          SEXO: data.sexo,
          NASC: data.nascimento,
          NOME_MAE: data.nome_mae,
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        error: "CPF not found or no data available",
      })
    }
  } catch (error) {
    console.error("Error fetching CPF data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch CPF data. Please try again later.",
      },
      { status: 500 },
    )
  }
}
