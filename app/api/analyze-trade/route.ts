import { generateText } from "ai"

export async function POST(request: Request) {
  const body = await request.json()
  const { asset, buyPrice, sellPrice, buyDate, sellDate, pnl, pnlPercent, holdingDays, notes } = body

  const prompt = `Analyze this crypto trade and provide insights:

Asset: ${asset}
Buy Price: $${buyPrice}
Sell Price: $${sellPrice}
Buy Date: ${new Date(buyDate).toLocaleDateString()}
Sell Date: ${new Date(sellDate).toLocaleDateString()}
Holding Period: ${holdingDays} days
PnL: $${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)
${notes ? `Trader's Notes: ${notes}` : ""}

Please provide:
1. A brief assessment of this trade's execution
2. What went well and what could be improved
3. Risk management observations
4. Psychological insights (if any patterns detected)
5. One actionable tip for future trades

Keep the response concise and practical (under 200 words).`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    return Response.json({ analysis: text })
  } catch (error) {
    console.error("AI analysis error:", error)
    return Response.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
